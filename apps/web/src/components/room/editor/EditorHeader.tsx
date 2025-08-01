import { RoomSchema } from '@coderscreen/api/schema/room';
import { RiArrowRightLine, RiCloseLine } from '@remixicon/react';
import { useCallback, useEffect, useState } from 'react';
import { LanguageIcon } from '@/components/common/LanguageIcon';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRoomContext } from '@/contexts/RoomContext';
import { useMultiFileCodeEditor } from '@/query/realtime/multiFileCode.query';

const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'c++', label: 'C++' },
  { value: 'bash', label: 'Bash' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
] satisfies {
  value: RoomSchema['language'];
  label: string;
}[];

const SUPPORTED_WEB_FRAMEWORKS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'nextjs', label: 'Next.js' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'remixjs', label: 'Remix.js' },
  { value: 'solidjs', label: 'Solid.js' },
] satisfies {
  value: RoomSchema['language'];
  label: string;
}[];

interface EditorHeaderProps {
  handleWorkspaceReset: (language: RoomSchema['language']) => void;
}

export const EditorHeader = ({ handleWorkspaceReset }: EditorHeaderProps) => {
  const { provider, isReadOnly } = useRoomContext();

  const [language, setLanguageState] = useState<RoomSchema['language']>('javascript');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<RoomSchema['language'] | null>(null);

  // Check if language switch requires confirmation
  const requiresConfirmation = useCallback(
    (fromLang: RoomSchema['language'], toLang: RoomSchema['language']) => {
      // No confirmation needed for js->ts or c->c++
      if (
        (fromLang === 'javascript' && toLang === 'typescript') ||
        (fromLang === 'c' && toLang === 'c++')
      ) {
        return false;
      }
      return true;
    },
    []
  );

  // Set the shared language in Yjs document
  const setLanguage = useCallback(
    (language: RoomSchema['language']) => {
      if (!provider) return;

      const ytext = provider.doc.getText('language');

      provider.doc.transact(() => {
        ytext.delete(0, ytext.length);
        ytext.insert(0, language);
      });
    },
    [provider]
  );

  // Handle language change with confirmation
  const handleLanguageChange = useCallback(
    (newLanguage: RoomSchema['language']) => {
      if (requiresConfirmation(language, newLanguage)) {
        setPendingLanguage(newLanguage);
        setShowConfirmDialog(true);
      } else {
        setLanguage(newLanguage);
      }
    },
    [language, requiresConfirmation, setLanguage]
  );

  // Confirm language change
  const confirmLanguageChange = useCallback(() => {
    if (pendingLanguage) {
      // need to reset whole workspace to be like the new language
      handleWorkspaceReset(pendingLanguage);

      setLanguage(pendingLanguage);
      setPendingLanguage(null);
      setShowConfirmDialog(false);
    }
  }, [pendingLanguage, setLanguage, handleWorkspaceReset]);

  // Cancel language change
  const cancelLanguageChange = useCallback(() => {
    setPendingLanguage(null);
    setShowConfirmDialog(false);
  }, []);

  // Subscribe to language changes
  const subscribeToLanguageChanges = useCallback(
    (callback: (language: RoomSchema['language']) => void) => {
      if (!provider) return () => {};

      const ymap = provider.doc.getText('language');
      const observer = () => {
        const language = ymap.toJSON();
        callback(language as RoomSchema['language']);
      };

      ymap.observe(observer);
      return () => ymap.unobserve(observer);
    },
    [provider]
  );

  // Subscribe to language changes and update local state
  useEffect(() => {
    if (!provider) return;

    const unsubscribe = subscribeToLanguageChanges((newLanguage) => {
      setLanguageState(newLanguage);
    });

    return unsubscribe;
  }, [provider, subscribeToLanguageChanges]);

  return (
    <>
      <div className='flex items-center justify-between border-b p-2 py-1'>
        <div className='flex items-center gap-2'>
          <Select
            value={language}
            onValueChange={(value) => handleLanguageChange(value as RoomSchema['language'])}
            disabled={isReadOnly}
          >
            <SelectTrigger className='min-w-40'>
              <SelectValue placeholder='Select a language' />
            </SelectTrigger>
            <SelectContent className='[&_[data-radix-select-viewport]]:p-0'>
              <div className='grid grid-cols-2 gap-4 p-4'>
                <div className='flex flex-col gap-2'>
                  <div className='text-sm font-medium text-gray-500 mb-2'>Languages</div>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      <span className='flex items-center gap-1'>
                        <LanguageIcon language={lang.value} />
                        {lang.label}
                      </span>
                    </SelectItem>
                  ))}
                </div>

                <div className='flex flex-col gap-2'>
                  <div className='text-sm font-medium text-gray-500 mb-2'>Web Frameworks</div>
                  {SUPPORTED_WEB_FRAMEWORKS.map((framework) => (
                    <SelectItem key={framework.value} value={framework.value}>
                      <span className='flex items-center gap-1'>
                        <LanguageIcon language={framework.value} />
                        {framework.label}
                      </span>
                    </SelectItem>
                  ))}
                </div>
              </div>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Switch Language?</DialogTitle>
            <DialogDescription>
              Switching your language will reset your code. Are you sure you want to continue? You
              will not be able to revert this action.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='mt-4'>
            <Button icon={RiCloseLine} variant='secondary' onClick={cancelLanguageChange}>
              Cancel
            </Button>
            <Button icon={RiArrowRightLine} iconPosition='right' onClick={confirmLanguageChange}>
              Switch Language
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

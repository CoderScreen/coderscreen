'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RiSettings3Line } from '@remixicon/react';
import { Divider } from '@/components/ui/divider';

export interface EditorSettings {
  fontSize: number;
  fontFamily: string;
  theme: 'vs' | 'vs-dark' | 'hc-black';
  minimap: boolean;
  wordWrap: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
  lineNumbers: 'on' | 'off' | 'relative' | 'interval';
  folding: boolean;
  automaticLayout: boolean;
  scrollBeyondLastLine: boolean;
  roundedSelection: boolean;
  lineDecorationsWidth: number;
  lineNumbersMinChars: number;
  glyphMargin: boolean;
  padding: { top: number; bottom: number };
}

const DEFAULT_SETTINGS: EditorSettings = {
  fontSize: 14,
  fontFamily: 'JetBrains Mono, Consolas, monospace',
  theme: 'vs',
  minimap: false,
  wordWrap: 'on',
  lineNumbers: 'on',
  folding: true,
  automaticLayout: true,
  scrollBeyondLastLine: false,
  roundedSelection: false,
  lineDecorationsWidth: 10,
  lineNumbersMinChars: 3,
  glyphMargin: false,
  padding: { top: 10, bottom: 10 },
};

const FONT_FAMILIES = [
  { value: 'JetBrains Mono, Consolas, monospace', label: 'JetBrains Mono' },
  { value: 'Consolas, monospace', label: 'Consolas' },
  { value: 'Fira Code, monospace', label: 'Fira Code' },
  { value: 'Source Code Pro, monospace', label: 'Source Code Pro' },
  { value: 'Monaco, monospace', label: 'Monaco' },
  { value: 'Menlo, monospace', label: 'Menlo' },
  { value: 'Courier New, monospace', label: 'Courier New' },
];

const THEMES = [
  { value: 'vs', label: 'Light' },
  { value: 'vs-dark', label: 'Dark' },
  { value: 'hc-black', label: 'High Contrast' },
];

const WORD_WRAP_OPTIONS = [
  { value: 'off', label: 'Off' },
  { value: 'on', label: 'On' },
  { value: 'wordWrapColumn', label: 'Word Wrap Column' },
  { value: 'bounded', label: 'Bounded' },
];

const LINE_NUMBER_OPTIONS = [
  { value: 'on', label: 'On' },
  { value: 'off', label: 'Off' },
  { value: 'relative', label: 'Relative' },
  { value: 'interval', label: 'Interval' },
];

interface EditorSettingsDialogProps {
  settings: EditorSettings;
  onSettingsChange: (settings: EditorSettings) => void;
  disabled?: boolean;
}

export function EditorSettingsDialog({
  settings,
  onSettingsChange,
  disabled,
}: EditorSettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState<EditorSettings>(settings);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSettingsChange(localSettings);
    setOpen(false);
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
  };

  const updateSetting = <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updatePadding = (key: 'top' | 'bottom', value: number) => {
    setLocalSettings((prev) => ({
      ...prev,
      padding: { ...prev.padding, [key]: value },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          icon={RiSettings3Line}
          disabled={disabled}
          className='h-8 w-8 p-0'
        />
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Editor Settings</DialogTitle>
          <DialogDescription>
            Customize the appearance and behavior of the code editor.
          </DialogDescription>
        </DialogHeader>

        <Divider />

        <div className='grid gap-4'>
          {/* Font Settings */}
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='fontSize'>Font Size</Label>
                <Input
                  id='fontSize'
                  type='number'
                  min='8'
                  max='24'
                  value={localSettings.fontSize}
                  onChange={(e) => updateSetting('fontSize', parseInt(e.target.value) || 14)}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='fontFamily'>Font Family</Label>
                <Select
                  value={localSettings.fontFamily}
                  onValueChange={(value) => updateSetting('fontFamily', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_FAMILIES.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Theme */}
            <div className='space-y-2'>
              <Label htmlFor='theme'>Theme</Label>
              <Select
                value={localSettings.theme}
                onValueChange={(value: EditorSettings['theme']) => updateSetting('theme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {THEMES.map((theme) => (
                    <SelectItem key={theme.value} value={theme.value}>
                      {theme.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='wordWrap'>Word Wrap</Label>
                <Select
                  value={localSettings.wordWrap}
                  onValueChange={(value: EditorSettings['wordWrap']) =>
                    updateSetting('wordWrap', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WORD_WRAP_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='lineNumbers'>Line Numbers</Label>
                <Select
                  value={localSettings.lineNumbers}
                  onValueChange={(value: EditorSettings['lineNumbers']) =>
                    updateSetting('lineNumbers', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LINE_NUMBER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='folding'>Code Folding</Label>
                <Switch
                  id='folding'
                  checked={localSettings.folding}
                  onCheckedChange={(checked) => updateSetting('folding', checked)}
                />
              </div>
              <div className='flex items-center justify-between'>
                <Label htmlFor='automaticLayout'>Automatic Layout</Label>
                <Switch
                  id='automaticLayout'
                  checked={localSettings.automaticLayout}
                  onCheckedChange={(checked) => updateSetting('automaticLayout', checked)}
                />
              </div>
              <div className='flex items-center justify-between'>
                <Label htmlFor='scrollBeyondLastLine'>Scroll Beyond Last Line</Label>
                <Switch
                  id='scrollBeyondLastLine'
                  checked={localSettings.scrollBeyondLastLine}
                  onCheckedChange={(checked) => updateSetting('scrollBeyondLastLine', checked)}
                />
              </div>
              <div className='flex items-center justify-between'>
                <Label htmlFor='roundedSelection'>Rounded Selection</Label>
                <Switch
                  id='roundedSelection'
                  checked={localSettings.roundedSelection}
                  onCheckedChange={(checked) => updateSetting('roundedSelection', checked)}
                />
              </div>
              <div className='flex items-center justify-between'>
                <Label htmlFor='glyphMargin'>Glyph Margin</Label>
                <Switch
                  id='glyphMargin'
                  checked={localSettings.glyphMargin}
                  onCheckedChange={(checked) => updateSetting('glyphMargin', checked)}
                />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='lineDecorationsWidth'>Line Decorations Width</Label>
                <Input
                  id='lineDecorationsWidth'
                  type='number'
                  min='0'
                  max='50'
                  value={localSettings.lineDecorationsWidth}
                  onChange={(e) =>
                    updateSetting('lineDecorationsWidth', parseInt(e.target.value) || 10)
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='lineNumbersMinChars'>Line Numbers Min Chars</Label>
                <Input
                  id='lineNumbersMinChars'
                  type='number'
                  min='1'
                  max='10'
                  value={localSettings.lineNumbersMinChars}
                  onChange={(e) =>
                    updateSetting('lineNumbersMinChars', parseInt(e.target.value) || 3)
                  }
                />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='paddingTop'>Padding Top</Label>
                <Input
                  id='paddingTop'
                  type='number'
                  min='0'
                  max='50'
                  value={localSettings.padding.top}
                  onChange={(e) => updatePadding('top', parseInt(e.target.value) || 10)}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='paddingBottom'>Padding Bottom</Label>
                <Input
                  id='paddingBottom'
                  type='number'
                  min='0'
                  max='50'
                  value={localSettings.padding.bottom}
                  onChange={(e) => updatePadding('bottom', parseInt(e.target.value) || 10)}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className='mt-4'>
          <Button variant='ghost' onClick={handleReset}>
            Reset to Default
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import {
  type ClientOptions,
  loadSandpackClient,
  type SandboxSetup,
  type SandpackClient,
  type SandpackMessage,
} from '@codesandbox/sandpack-client';
import type React from 'react';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type * as Y from 'yjs';
import { useRoomContext } from '@/contexts/RoomContext';
import { debounce } from '@/lib/debounce';

// FSEntry interface to match the one in docUtils
interface FSEntry {
  type: 'file' | 'folder';
  name: string;
  parentId: string | null;
  children?: string[];
}

// Constants for console functionality
const CLEAR_LOG = { id: 'clear', method: 'clear', data: [] };
const MAX_MESSAGE_COUNT = 100;
const SYNTAX_ERROR_PATTERN = [
  'SyntaxError:',
  'ReferenceError:',
  'TypeError:',
  'RangeError:',
  'EvalError:',
  'URIError:',
];

// Types for console data
export interface SandpackConsoleData {
  id: string;
  method: string;
  data: unknown[];
}

interface SandpackContextType {
  // Sandpack client related
  sandpackClient: SandpackClient | null;
  sandpackLoading: boolean;
  isDocumentReady: boolean;
  initializeSandpackClient: (iframe: HTMLIFrameElement) => Promise<void>;
  // Console related
  logs: SandpackConsoleData[];
  resetConsole: () => void;
}

const SandpackContext = createContext<SandpackContextType | undefined>(undefined);

interface SandpackProviderProps {
  children: ReactNode;
}

const SANDBOX_OPTIONS: ClientOptions = {
  showOpenInCodeSandbox: false,
  showErrorScreen: true,
  showLoadingScreen: true,
};

export const SandpackProvider: React.FC<SandpackProviderProps> = ({ children }) => {
  const { provider } = useRoomContext();

  // Sandpack client state
  const [sandpackClient, setSandpackClient] = useState<SandpackClient | null>(null);
  const [sandpackLoading, setSandpackLoading] = useState(false);
  const [isDocumentReady, setIsDocumentReady] = useState(false);

  // Console state
  const [logs, setLogs] = useState<SandpackConsoleData[]>([]);
  const consoleOptions = useMemo(
    () => ({
      maxMessageCount: MAX_MESSAGE_COUNT,
      showSyntaxError: false,
      resetOnPreviewRestart: true,
    }),
    []
  );

  // Simple document ready check
  useEffect(() => {
    if (!provider) return;

    const checkDocumentReady = () => {
      // Document is ready when provider is connected and synced
      if (provider.wsconnected && provider.synced) {
        console.log('Document is ready for Sandpack initialization');
        setIsDocumentReady(true);
      } else {
        setIsDocumentReady(false);
      }
    };

    // Check immediately
    checkDocumentReady();

    // Listen for connection and sync events
    const handleStatus = () => checkDocumentReady();
    const handleSynced = () => checkDocumentReady();

    provider.on('status', handleStatus);
    provider.on('synced', handleSynced);

    return () => {
      provider.off('status', handleStatus);
      provider.off('synced', handleSynced);
    };
  }, [provider]);

  // Update the sandpack client when files change
  useEffect(() => {
    if (!sandpackClient) return;

    const updateSandpackClient = () => {
      const updatedContent = buildFilesToSandpackSetup(provider.doc);
      console.log('updating sandboxClient with', updatedContent);
      sandpackClient.updateSandbox(updatedContent);
    };

    // Debounce the update function to prevent excessive calls
    const debouncedUpdate = debounce(updateSandpackClient, 300);

    // Observe the file change counter
    const fileChangeCounter = provider.doc.getMap('__fileChangeCounter');

    const handleFileChangeCounter = (event: Y.YMapEvent<unknown>) => {
      // Only update when the value changes
      if (event.changes.keys.has('value')) {
        console.log('file change counter updated, updating sandpack client');
        debouncedUpdate();
      }
    };

    // Observe the file change counter
    fileChangeCounter.observe(handleFileChangeCounter);

    return () => {
      fileChangeCounter.unobserve(handleFileChangeCounter);
    };
  }, [provider.doc, sandpackClient]);

  const handleConsoleMessage = useCallback(
    (message: SandpackMessage) => {
      if (consoleOptions.resetOnPreviewRestart && message.type === 'start') {
        setLogs([]);
      } else if (message.type === 'console' && message.codesandbox) {
        const payloadLog = Array.isArray(message.log) ? message.log : [message.log];

        if (payloadLog.find(({ method }) => method === 'clear')) {
          return setLogs([CLEAR_LOG]);
        }

        const logsMessages = consoleOptions.showSyntaxError
          ? payloadLog
          : payloadLog.filter((messageItem) => {
              const messagesWithoutSyntaxErrors =
                messageItem?.data?.filter?.((dataItem) => {
                  if (typeof dataItem !== 'string') return true;

                  const matches = SYNTAX_ERROR_PATTERN.filter((lookFor) =>
                    dataItem.startsWith(lookFor)
                  );

                  return matches.length === 0;
                }) ?? [];

              return messagesWithoutSyntaxErrors.length > 0;
            });

        if (!logsMessages) return;

        setLogs((prev) => {
          const messages = [...prev, ...logsMessages].filter((value, index, self) => {
            return index === self.findIndex((s) => s.id === value.id);
          });

          while (messages.length > consoleOptions.maxMessageCount) {
            messages.shift();
          }

          return messages;
        });
      }
    },
    [consoleOptions]
  );

  // Initialize Sandpack client function
  const initializeSandpackClient = useCallback(
    async (iframe: HTMLIFrameElement, doc: Y.Doc) => {
      console.log('initializing sandpack client');
      try {
        const builtFiles = buildFilesToSandpackSetup(doc);
        console.log('builtFiles for init', builtFiles);

        setSandpackLoading(true);
        const client = await loadSandpackClient(
          iframe,
          buildFilesToSandpackSetup(doc),
          SANDBOX_OPTIONS
        );

        client.listen((event) => {
          handleConsoleMessage(event);
          setSandpackClient(client);
        });

        setSandpackClient(client);
      } catch (error) {
        console.error('Failed to load Sandpack client:', error);
      } finally {
        setSandpackLoading(false);
      }
    },
    [handleConsoleMessage]
  );

  // Console functionality
  const resetConsole = useCallback(() => {
    setLogs([]);
  }, []);

  return (
    <SandpackContext.Provider
      value={{
        sandpackClient,
        sandpackLoading,
        isDocumentReady,
        initializeSandpackClient: (iframe: HTMLIFrameElement) =>
          initializeSandpackClient(iframe, provider.doc),
        logs,
        resetConsole,
      }}
    >
      {children}
    </SandpackContext.Provider>
  );
};

export const useSandpackContext = () => {
  const context = useContext(SandpackContext);
  if (context === undefined) {
    throw new Error('useSandpackContext must be used within a SandpackProvider');
  }
  return context;
};

// #########################################################
// Helper functions
// #########################################################
const buildFilesToSandpackSetup = (doc: Y.Doc): SandboxSetup => {
  const language = doc.getText('language').toJSON();

  const templateFromLanguage: SandboxSetup['template'] = (() => {
    switch (language) {
      case 'react':
        return 'create-react-app';
      case 'vue':
        return 'vue-cli';
      case 'svelte':
        return 'svelte';
      default:
        return undefined;
    }
  })();

  const fsMap = doc.getMap<FSEntry>('fs');
  const newSetup: SandboxSetup = {
    files: {},
    template: templateFromLanguage,
  };

  // Helper function to get path from ID
  const getPathFromId = (itemId: string): string => {
    const entry = fsMap.get(itemId);
    if (!entry) return '';

    if (!entry.parentId) {
      return entry.name;
    }

    const parentPath = getPathFromId(entry.parentId);
    return parentPath ? `${parentPath}/${entry.name}` : entry.name;
  };

  // Iterate over all file entries and build the sandbox setup
  fsMap.forEach((entry, id) => {
    if (entry.type === 'file') {
      const filePath = getPathFromId(id);
      const codeValue = doc.getText(`file:${id}`).toJSON();
      newSetup.files[filePath] = {
        code: codeValue,
      };
    }
  });

  // Get dependencies and devDependencies from package.json
  const packageJsonPath = '/package.json';
  const packageJsonId = findFileIdByPath(fsMap, packageJsonPath);

  let packageContent = JSON.stringify({
    dependencies: {},
    devDependencies: {},
  });

  if (packageJsonId) {
    const packageJsonText = doc.getText(`file:${packageJsonId}`);
    packageContent = packageJsonText.toString();
  }

  console.log('packageJSONContent', packageContent);
  const packageJson: {
    dependencies: { [key: string]: string };
    devDependencies: { [key: string]: string };
  } = JSON.parse(packageContent);

  newSetup.dependencies = packageJson.dependencies;
  newSetup.devDependencies = packageJson.devDependencies;

  return newSetup;
};

// Helper function to find file ID by path
const findFileIdByPath = (fsMap: Y.Map<FSEntry>, path: string): string | null => {
  if (!path) return null;

  const pathParts = path.split('/').filter((part) => part.length > 0);
  if (pathParts.length === 0) return null;

  // Find root items (items with no parent)
  const rootItems: string[] = [];
  fsMap.forEach((entry, id) => {
    if (!entry.parentId) {
      rootItems.push(id);
    }
  });

  // Walk down the tree following the path
  let currentId: string | null = null;
  let currentEntry: FSEntry | null = null;

  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];

    if (i === 0) {
      // Look for root item
      for (const rootId of rootItems) {
        const entry = fsMap.get(rootId);
        if (entry && entry.name === part) {
          currentId = rootId;
          currentEntry = entry;
          break;
        }
      }
    } else {
      // Look for child item
      if (!currentEntry || currentEntry.type !== 'folder' || !currentEntry.children) {
        return null;
      }

      let found = false;
      for (const childId of currentEntry.children) {
        const childEntry = fsMap.get(childId);
        if (childEntry && childEntry.name === part) {
          currentId = childId;
          currentEntry = childEntry;
          found = true;
          break;
        }
      }

      if (!found) {
        return null;
      }
    }
  }

  return currentId && currentEntry ? currentId : null;
};

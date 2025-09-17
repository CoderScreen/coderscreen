'use client';

import {
  RiErrorWarningLine,
  RiProhibitedLine,
  RiRefreshLine,
  RiResetRightLine,
  RiTerminalLine,
} from '@remixicon/react';
import { useEffect, useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { useSandpackContext } from '@/contexts/SandpackContext';

export const SandpackOutput = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { sandpackClient, sandpackLoading, isDocumentReady, initializeSandpackClient } =
    useSandpackContext();
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  // Initialize Sandpack client once when document is ready
  useEffect(() => {
    if (!iframeRef.current || !isDocumentReady || sandpackClient) {
      return;
    }

    const loadClient = async () => {
      if (!iframeRef.current) return;

      try {
        setHasError(false);
        setErrorMessage('');
        console.log('Initializing Sandpack client - document is ready');
        await initializeSandpackClient(iframeRef.current);
      } catch (error) {
        console.error('Failed to initialize Sandpack client:', error);
        setHasError(true);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to initialize sandbox');
      }
    };

    loadClient();
  }, [isDocumentReady, sandpackClient, initializeSandpackClient]);

  const handleRetry = async () => {
    if (!iframeRef.current || !isDocumentReady) return;

    try {
      setHasError(false);
      setErrorMessage('');
      setRetryCount((prev) => prev + 1);
      console.log(`Retrying Sandpack client initialization (attempt ${retryCount + 1})`);
      await initializeSandpackClient(iframeRef.current);
    } catch (error) {
      console.error('Retry failed:', error);
      setHasError(true);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to initialize sandbox');
    }
  };

  // Determine loading state
  const isLoading = !isDocumentReady || sandpackLoading || (!sandpackClient && !hasError);
  const loadingMessage = !isDocumentReady
    ? 'Connecting to room...'
    : sandpackLoading
      ? 'Loading sandbox...'
      : 'Initializing sandbox...';

  return (
    <div className='h-full w-full bg-white flex flex-col relative'>
      {isLoading && (
        <div className='flex items-center justify-center h-full'>
          <div className='flex flex-col items-center justify-center space-y-4'>
            {/* Enhanced loading spinner matching app style */}
            <div className='relative'>
              <div className='h-12 w-12 rounded-full border-4 border-gray-200'></div>
              <div className='absolute inset-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent border-t-blue-500'></div>
            </div>

            {/* Loading text with animated dots */}
            <div className='text-center'>
              <h3 className='text-lg font-medium text-gray-700 mb-1'>
                {loadingMessage}
                <span className='inline-block animate-pulse'>.</span>
                <span className='inline-block animate-pulse [animation-delay:0.2s]'>.</span>
                <span className='inline-block animate-pulse [animation-delay:0.4s]'>.</span>
              </h3>
              <p className='text-sm text-gray-500'>
                {!isDocumentReady
                  ? 'Establishing connection to the room'
                  : sandpackLoading
                    ? 'Setting up your development environment'
                    : 'Preparing the sandbox for your code'}
              </p>
            </div>
          </div>
        </div>
      )}

      {hasError && (
        <div className='flex items-center justify-center h-full bg-red-50'>
          <div className='text-center space-y-4 max-w-md mx-auto px-4'>
            {/* Error icon */}
            <div className='flex justify-center'>
              <div className='w-16 h-16 rounded-full bg-red-100 flex items-center justify-center'>
                <RiErrorWarningLine className='w-8 h-8 text-red-500' />
              </div>
            </div>

            {/* Error content */}
            <div className='space-y-2'>
              <h3 className='text-lg font-semibold text-red-900'>Failed to Load Sandbox</h3>
              <p className='text-sm text-red-700'>
                {errorMessage ||
                  'Something went wrong while initializing the code sandbox. Please try again.'}
              </p>
              {retryCount > 0 && <p className='text-xs text-red-600'>Retry attempt {retryCount}</p>}
            </div>

            {/* Retry button */}
            <div className='pt-2'>
              <Button
                variant='primary'
                icon={RiRefreshLine}
                onClick={handleRetry}
                className='bg-red-600 hover:bg-red-700 text-white'
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className='flex items-center justify-end absolute top-2 right-2 z-10'>
        <Tooltip triggerAsChild content='Reset the sandbox' showArrow>
          <Button
            variant='icon'
            onClick={() => {
              sandpackClient?.dispatch({
                type: 'refresh',
              });
            }}
          >
            <RiResetRightLine className='w-4 h-4' />
          </Button>
        </Tooltip>
      </div>

      <PanelGroup direction='vertical' className='h-full'>
        <Panel defaultSize={75} minSize={30} className='p-2'>
          <iframe ref={iframeRef} className='w-full h-full' title='Code Sandbox Preview' />
        </Panel>

        <PanelResizeHandle className='bg-gray-300 hover:bg-gray-400 transition-colors' />

        <Panel defaultSize={25} minSize={15} maxSize={75}>
          <SandpackConsole />
        </Panel>
      </PanelGroup>
    </div>
  );
};

const SandpackConsole = () => {
  const { logs, resetConsole } = useSandpackContext();

  const getLogColor = (method: string) => {
    switch (method) {
      case 'error':
        return 'text-red-600 bg-red-50 px-2 py-1 rounded border-l-2 border-red-500';
      case 'warn':
        return 'text-amber-700 bg-amber-50 px-2 py-1 rounded border-l-2 border-amber-500';
      case 'info':
        return 'text-blue-600 bg-blue-50 px-2 py-1 rounded border-l-2 border-blue-500';
      case 'debug':
        return 'text-purple-600 bg-purple-50 px-2 py-1 rounded border-l-2 border-purple-500';
      default:
        return 'text-gray-800 bg-gray-50 px-2 py-1 rounded';
    }
  };

  const formatLogData = (data: unknown[]): string => {
    return data
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }
        if (typeof item === 'object') {
          return JSON.stringify(item, null, 2);
        }
        return String(item);
      })
      .join(' ');
  };

  return (
    <div className='border-t border-gray-200 flex flex-col h-full'>
      <div className='flex items-center justify-between p-2 border-b border-gray-200'>
        <h3 className='text-sm font-medium text-gray-700 flex items-center gap-1'>
          <RiTerminalLine className='w-4 h-4' />
          Console
        </h3>
        <Button variant='icon' onClick={resetConsole}>
          <RiProhibitedLine className='w-3 h-3' />
        </Button>
      </div>
      <div className='flex-1 overflow-y-auto p-3 font-mono text-xs space-y-2'>
        {logs.length === 0 ? (
          <div className='text-center py-8'>
            <div className='text-gray-400 mb-2'>
              <RiTerminalLine className='w-6 h-6 mx-auto' />
            </div>
            <p className='text-gray-500 text-sm'>No console output yet...</p>
            <p className='text-gray-400 text-xs mt-1'>Run your code to see output here</p>
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={`${log.id}-${index}`} className='mb-2'>
              <div className={`${getLogColor(log.method)} text-xs leading-relaxed`}>
                {formatLogData(log.data)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

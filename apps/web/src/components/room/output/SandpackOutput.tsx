'use client';

import type { ClientOptions, SandboxSetup } from '@codesandbox/sandpack-client';
import { RiDeleteBin6Line, RiProhibitedLine, RiResetRightLine } from '@remixicon/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { useSandpackContext } from '@/contexts/SandpackContext';

export const SandpackOutput = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { sandpackClient, sandpackLoading, initializeSandpackClient } = useSandpackContext();

  // Initialize client once when component mounts
  useEffect(() => {
    if (!iframeRef.current) {
      return;
    }

    const loadClient = async () => {
      if (!iframeRef.current) return;
      await initializeSandpackClient(iframeRef.current);
    };

    loadClient();
  }, [initializeSandpackClient]);

  // Determine loading state based on client status
  const getLoadingState = () => {
    if (!sandpackClient) {
      return 'client-initializing-state';
    }
    return sandpackClient.status || 'unknown';
  };

  return (
    <div className='h-full w-full bg-white flex flex-col relative'>
      {sandpackLoading && (
        <div className='flex items-center justify-center h-full'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2'></div>
            <p className='text-sm text-gray-600'>{getLoadingState()}</p>
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
        return 'text-red-600';
      case 'warn':
        return 'text-yellow-600';
      case 'info':
        return 'text-blue-600';
      case 'debug':
        return 'text-purple-600';
      default:
        return 'text-gray-800';
    }
  };

  const formatLogData = (data: any[]): string => {
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
        <h3 className='text-sm font-medium text-gray-700'>Console</h3>
        <Button variant='icon' onClick={resetConsole}>
          <RiProhibitedLine className='w-3 h-3' />
        </Button>
      </div>
      <div className='flex-1 overflow-y-auto p-2 font-mono text-xs'>
        {logs.length === 0 ? (
          <div className='text-gray-500 italic'>No console output yet...</div>
        ) : (
          logs.map((log, index) => (
            <div key={`${log.id}-${index}`} className='mb-1'>
              <span className={`${getLogColor(log.method)}`}>{formatLogData(log.data)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

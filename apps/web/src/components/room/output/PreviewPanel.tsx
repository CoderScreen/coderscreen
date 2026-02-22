import { Button } from '@coderscreen/ui/button';
import {
  RiErrorWarningLine,
  RiPlayLine,
  RiRefreshLine,
  RiStopLine,
} from '@remixicon/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCurrentRoomId } from '@/lib/params';
import { useRoomContext } from '@/contexts/RoomContext';

const API_URL = import.meta.env.VITE_API_URL;

type PreviewState = 'idle' | 'installing' | 'running' | 'error';

export const PreviewPanel = () => {
  const roomId = useCurrentRoomId();
  const { currentLanguage, provider } = useRoomContext();
  const [state, setState] = useState<PreviewState>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Subscribe to Yjs previewUrl for cross-participant sync
  useEffect(() => {
    if (!provider) return;

    const previewUrlField = provider.doc.getText('previewUrl');

    // Read initial value
    const initialUrl = previewUrlField.toJSON();
    if (initialUrl) {
      setPreviewUrl(initialUrl);
      setState('running');
    }

    // Observe changes from other participants
    const handleChange = () => {
      const newUrl = previewUrlField.toJSON();
      if (newUrl) {
        setPreviewUrl(newUrl);
        setState('running');
      } else {
        setPreviewUrl(null);
        setState('idle');
      }
    };

    previewUrlField.observe(handleChange);
    return () => previewUrlField.unobserve(handleChange);
  }, [provider]);

  const startPreview = useCallback(async () => {
    if (!currentLanguage || !provider) return;

    setState('installing');
    setErrorMessage('');

    try {
      const response = await fetch(
        `${API_URL}/rooms/${roomId}/public/preview/start`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: currentLanguage }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'Failed to start preview' }));
        throw new Error((data as { message?: string }).message || `HTTP ${response.status}`);
      }

      const data = (await response.json()) as { previewUrl: string };

      // Store in Yjs so other participants get the URL
      const previewUrlField = provider.doc.getText('previewUrl');
      provider.doc.transact(() => {
        previewUrlField.delete(0, previewUrlField.length);
        previewUrlField.insert(0, data.previewUrl);
      });
    } catch (error) {
      setState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to start preview');
    }
  }, [roomId, currentLanguage, provider]);

  const stopPreview = useCallback(async () => {
    // Clear Yjs previewUrl (syncs to all participants)
    if (provider) {
      const previewUrlField = provider.doc.getText('previewUrl');
      provider.doc.transact(() => {
        previewUrlField.delete(0, previewUrlField.length);
      });
    }

    try {
      await fetch(`${API_URL}/rooms/${roomId}/public/preview/stop`, {
        method: 'POST',
      });
    } catch {
      // Best effort stop
    }
  }, [roomId, provider]);

  const restartPreview = useCallback(async () => {
    await stopPreview();
    await startPreview();
  }, [stopPreview, startPreview]);

  if (state === 'idle') {
    return (
      <div className="h-full w-full bg-white flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
            <RiPlayLine className="text-blue-500 size-6" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Preview</h3>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            Start a live dev server to preview your app
          </p>
          <Button variant="primary" icon={RiPlayLine} onClick={startPreview}>
            Start Preview
          </Button>
        </div>
      </div>
    );
  }

  if (state === 'installing') {
    return (
      <div className="h-full w-full bg-white flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-gray-200" />
            <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent border-t-blue-500" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-1">
              Installing dependencies
              <span className="inline-block animate-pulse">.</span>
              <span className="inline-block animate-pulse [animation-delay:0.2s]">.</span>
              <span className="inline-block animate-pulse [animation-delay:0.4s]">.</span>
            </h3>
            <p className="text-sm text-gray-500">
              Starting the Vite dev server
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="h-full w-full bg-white flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <RiErrorWarningLine className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-red-900">
              Failed to Start Preview
            </h3>
            <p className="text-sm text-red-700">
              {errorMessage || 'Something went wrong while starting the dev server.'}
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              icon={RiRefreshLine}
              onClick={startPreview}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // state === 'running'
  return (
    <div className="h-full w-full bg-white flex flex-col relative">
      <div className="flex items-center justify-end gap-1 px-2 py-1 border-b border-gray-200 bg-gray-50">
        <Button variant="icon" onClick={restartPreview} title="Restart preview">
          <RiRefreshLine className="w-4 h-4" />
        </Button>
        <Button variant="icon" onClick={stopPreview} title="Stop preview">
          <RiStopLine className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-1 min-h-0">
        <iframe
          ref={iframeRef}
          src={previewUrl ?? undefined}
          className="w-full h-full border-0"
          title="Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
      </div>
    </div>
  );
};

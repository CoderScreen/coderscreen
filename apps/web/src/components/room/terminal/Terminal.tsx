import { SandboxAddon, type ConnectionState } from '@cloudflare/sandbox/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal as XTerminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import { useEffect, useRef, useState } from 'react';
import { useCurrentRoomId } from '@/lib/params';

const API_URL = import.meta.env.VITE_API_URL;

export const Terminal = () => {
  const roomId = useCurrentRoomId();
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerminal | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#ffffff',
        foreground: '#1e1e1e',
        cursor: '#1e1e1e',
        selectionBackground: '#add6ff',
        black: '#1e1e1e',
        red: '#cd3131',
        green: '#00bc00',
        yellow: '#949800',
        blue: '#0451a5',
        magenta: '#bc05bc',
        cyan: '#0598bc',
        white: '#555555',
        brightBlack: '#666666',
        brightRed: '#cd3131',
        brightGreen: '#14ce14',
        brightYellow: '#b5ba00',
        brightBlue: '#0451a5',
        brightMagenta: '#bc05bc',
        brightCyan: '#0598bc',
        brightWhite: '#1e1e1e',
      },
    });
    xtermRef.current = term;

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    const sandboxAddon = new SandboxAddon({
      getWebSocketUrl: () => {
        const wsUrl = API_URL.replace(/^http/, 'ws');
        return `${wsUrl}/rooms/${roomId}/public/terminal`;
      },
      reconnect: true,
      onStateChange: (state) => setConnectionState(state),
    });
    term.loadAddon(sandboxAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    sandboxAddon.connect({ sandboxId: `s_${roomId}` });

    const observer = new ResizeObserver(() => {
      fitAddon.fit();
    });
    observer.observe(terminalRef.current);

    return () => {
      observer.disconnect();
      sandboxAddon.dispose();
      term.dispose();
      xtermRef.current = null;
    };
  }, [roomId]);

  return (
    <div className='relative h-full w-full'>
      {connectionState !== 'connected' && (
        <div className='absolute top-2 right-2 z-10 flex items-center gap-1.5 rounded bg-black/60 px-2 py-1 text-xs text-white'>
          <span
            className={`inline-block size-2 rounded-full ${
              connectionState === 'connecting' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'
            }`}
          />
          {connectionState === 'connecting' ? 'Connecting...' : 'Disconnected'}
        </div>
      )}
      <div ref={terminalRef} className='h-full w-full' />
    </div>
  );
};

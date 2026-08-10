import { type ConnectionState, SandboxAddon } from '@cloudflare/sandbox/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal as XTerminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import { useEffect, useRef, useState } from 'react';
import { useRoomContext } from '@/contexts/RoomContext';
import { useCurrentRoomId } from '@/lib/params';

const API_URL = import.meta.env.VITE_API_URL;

// Drop an idle terminal so it stops cold-booting the container.
const IDLE_DISCONNECT_MS = 3 * 60 * 1000;

export const Terminal = () => {
  const roomId = useCurrentRoomId();
  const { terminalInputRef } = useRoomContext();
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerminal | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  // PTY session id. Rotated whenever the backing shell exits (e.g. you exit the
  // shell with Ctrl-D) so we spawn a fresh shell instead of endlessly
  // reconnecting to a now-dead session.
  const [sessionId, setSessionId] = useState('default');

  useEffect(() => {
    const el = terminalRef.current;
    if (!el) return;

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
        return `${wsUrl}/rooms/${roomId}/public/terminal?sessionId=${encodeURIComponent(sessionId)}`;
      },
      reconnect: true,
      onStateChange: (state, error) => {
        setConnectionState(state);
        // The shell process ended (e.g. you exited the shell with Ctrl-D).
        // Reconnecting to the same session just loops, so start a fresh one,
        // which remounts this effect and spawns a new shell.
        if (error && /exited/i.test(error.message)) {
          setSessionId(`default-${crypto.randomUUID()}`);
        }
      },
    });
    term.loadAddon(sandboxAddon);

    term.open(el);
    fitAddon.fit();

    // Only stay connected while the terminal is used in a foreground tab.
    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const clearIdleTimer = () => {
      if (idleTimer) {
        clearTimeout(idleTimer);
        idleTimer = null;
      }
    };

    const disconnect = () => {
      clearIdleTimer();
      sandboxAddon.disconnect();
    };

    const armIdleTimer = () => {
      clearIdleTimer();
      idleTimer = setTimeout(disconnect, IDLE_DISCONNECT_MS);
    };

    const connect = () => {
      // Never open the socket from a hidden tab: a backgrounded room shouldn't
      // be booting containers.
      if (document.visibilityState !== 'visible') return;
      sandboxAddon.connect({ sandboxId: `s_${roomId}`, sessionId });
      armIdleTimer();
    };

    // Any interaction with the terminal keeps it alive and reconnects it if it
    // had gone idle/disconnected.
    const dataSub = term.onData(() => {
      connect();
      armIdleTimer();
    });
    const onPointerDown = () => connect();
    el.addEventListener('pointerdown', onPointerDown);

    // Pause when the tab is backgrounded, resume when it comes back.
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        connect();
      } else {
        disconnect();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    connect();

    // Register programmatic input method for Run button
    terminalInputRef.current = (cmd: string) => {
      connect();
      term.input(cmd, true);
    };

    const observer = new ResizeObserver(() => {
      fitAddon.fit();
    });
    observer.observe(el);

    return () => {
      clearIdleTimer();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      el.removeEventListener('pointerdown', onPointerDown);
      dataSub.dispose();
      observer.disconnect();
      terminalInputRef.current = null;
      sandboxAddon.dispose();
      term.dispose();
      xtermRef.current = null;
    };
  }, [roomId, terminalInputRef, sessionId]);

  return (
    <div className='relative h-full w-full'>
      {connectionState !== 'connected' && (
        <div className='absolute top-2 right-2 z-10 flex items-center gap-1.5 rounded bg-black/60 px-2 py-1 text-xs text-white'>
          <span
            className={`inline-block size-2 rounded-full ${
              connectionState === 'connecting' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'
            }`}
          />
          {connectionState === 'connecting' ? 'Connecting...' : 'Disconnected — click to reconnect'}
        </div>
      )}
      <div ref={terminalRef} className='h-full w-full' />
    </div>
  );
};

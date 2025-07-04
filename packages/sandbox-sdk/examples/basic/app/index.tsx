import type React from "react";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { HttpClient } from "../../../packages/sandbox/src/client";
import "./style.css";

interface CommandResult {
  id: string;
  command: string;
  args: string[];
  status: "running" | "completed" | "error";
  stdout: string;
  stderr: string;
  exitCode?: number;
  timestamp: Date;
}

function REPL() {
  const [client, setClient] = useState<HttpClient | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [commandInput, setCommandInput] = useState("");
  const [results, setResults] = useState<CommandResult[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const resultsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new results are added
  useEffect(() => {
    resultsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [results]);

  // Initialize HTTP client
  useEffect(() => {
    const httpClient = new HttpClient({
      baseUrl: window.location.origin,
      onCommandComplete: (
        success: boolean,
        exitCode: number,
        stdout: string,
        stderr: string,
        command: string,
        args: string[]
      ) => {
        setResults((prev) => {
          const updated = [...prev];
          const lastResult = updated[updated.length - 1];
          if (lastResult && lastResult.command === command) {
            lastResult.status = success ? "completed" : "error";
            lastResult.exitCode = exitCode;
            lastResult.stdout = stdout;
            lastResult.stderr = stderr;
          }
          return updated;
        });
        setIsExecuting(false);
      },
      onCommandStart: (command: string, args: string[]) => {
        console.log("Command started:", command, args);
        const newResult: CommandResult = {
          args,
          command,
          id: Date.now().toString(),
          status: "running",
          stderr: "",
          stdout: "",
          timestamp: new Date(),
        };
        setResults((prev) => [...prev, newResult]);
        setIsExecuting(true);
      },
      onError: (error: string, command?: string) => {
        console.error("Command error:", error);
        setResults((prev) => {
          const updated = [...prev];
          const lastResult = updated[updated.length - 1];
          if (lastResult && lastResult.command === command) {
            lastResult.status = "error";
            lastResult.stderr += `\nError: ${error}`;
          }
          return updated;
        });
        setIsExecuting(false);
      },
      onOutput: (
        stream: "stdout" | "stderr",
        data: string,
        command: string
      ) => {
        setResults((prev) => {
          const updated = [...prev];
          const lastResult = updated[updated.length - 1];
          if (lastResult && lastResult.command === command) {
            if (stream === "stdout") {
              lastResult.stdout += data;
            } else {
              lastResult.stderr += data;
            }
          }
          return updated;
        });
      },
      onStreamEvent: (event) => {
        console.log("Stream event:", event);
      },
    });

    setClient(httpClient);

    // Initialize connection by creating a session
    const initializeConnection = async () => {
      try {
        setConnectionStatus("connecting");

        // Test connection with ping
        await httpClient.ping();
        console.log("Server is reachable");

        // Create a session
        const session = await httpClient.createSession();
        setSessionId(session);
        setConnectionStatus("connected");
        console.log("Connected with session:", session);
      } catch (error: any) {
        console.error("Failed to connect:", error);
        setConnectionStatus("disconnected");
      }
    };

    initializeConnection();

    // Cleanup on unmount
    return () => {
      if (httpClient) {
        httpClient.clearSession();
      }
    };
  }, []);

  const executeCommand = async () => {
    if (!client || connectionStatus !== "connected" || !commandInput.trim() || isExecuting) {
      return;
    }

    const trimmedCommand = commandInput.trim();
    const parts = trimmedCommand.split(" ");
    const command = parts[0];
    const args = parts.slice(1);

    try {
      setIsExecuting(true);

      // Create a result entry for the command
      const newResult: CommandResult = {
        args,
        command,
        id: Date.now().toString(),
        status: "running",
        stderr: "",
        stdout: "",
        timestamp: new Date(),
      };
      setResults((prev) => [...prev, newResult]);

      // Execute the command
      console.log("Executing command:", command, args);
      const result = await client.execute(
        command,
        args,
        sessionId || undefined
      );
      console.log("Result:", result);

      // Update the result with the response
      setResults((prev) => {
        const updated = [...prev];
        const lastResult = updated[updated.length - 1];
        if (lastResult && lastResult.command === command) {
          lastResult.status = result.success ? "completed" : "error";
          lastResult.exitCode = result.exitCode;
          lastResult.stdout = result.stdout;
          lastResult.stderr = result.stderr;
        }
        return updated;
      });

      setCommandInput("");
    } catch (error: any) {
      console.error("Failed to execute command:", error);
      setResults((prev) => {
        const updated = [...prev];
        const lastResult = updated[updated.length - 1];
        if (lastResult && lastResult.command === command) {
          lastResult.status = "error";
          lastResult.stderr += `\nError: ${error.message || error}`;
        }
        return updated;
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const executeStreamingCommand = async () => {
    if (!client || connectionStatus !== "connected" || !commandInput.trim() || isExecuting) {
      return;
    }

    const trimmedCommand = commandInput.trim();
    const parts = trimmedCommand.split(" ");
    const command = parts[0];
    const args = parts.slice(1);

    try {
      setIsExecuting(true);

      // Create a result entry for the command
      const newResult: CommandResult = {
        args,
        command,
        id: Date.now().toString(),
        status: "running",
        stderr: "",
        stdout: "",
        timestamp: new Date(),
      };
      setResults((prev) => [...prev, newResult]);

      // Execute the command with streaming
      console.log("Executing streaming command:", command, args);
      await client.executeStream(command, args, sessionId || undefined);
      console.log("Streaming command completed");

      setCommandInput("");
    } catch (error: any) {
      console.error("Failed to execute streaming command:", error);
      setResults((prev) => {
        const updated = [...prev];
        const lastResult = updated[updated.length - 1];
        if (lastResult && lastResult.command === command) {
          lastResult.status = "error";
          lastResult.stderr += `\nError: ${error.message || error}`;
        }
        return updated;
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      executeCommand();
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  const getStatusColor = (status: CommandResult["status"]) => {
    switch (status) {
      case "running":
        return "text-blue-500";
      case "completed":
        return "text-green-500";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status: CommandResult["status"]) => {
    switch (status) {
      case "running":
        return "⏳";
      case "completed":
        return "✅";
      case "error":
        return "❌";
      default:
        return "⏳";
    }
  };

  return (
    <div className="repl-container">
      <div className="header">
        <h1>HTTP REPL</h1>
        <div
          className={`connection-status ${connectionStatus}`}
        >
          {connectionStatus === "connected"
            ? `Connected (${sessionId})`
            : connectionStatus === "connecting"
            ? "Connecting..."
            : "Disconnected"}
        </div>
      </div>

      <div className="command-bar">
        <span className="command-prompt">$</span>
        <input
          type="text"
          className="command-input"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter command (e.g., ls -la)"
          disabled={isExecuting}
        />
        <div className="action-buttons">
          <button
            type="button"
            onClick={executeCommand}
            disabled={!commandInput.trim() || isExecuting}
            className="btn btn-execute"
          >
            {isExecuting ? "Executing..." : "Execute"}
          </button>
          <button
            type="button"
            onClick={executeStreamingCommand}
            disabled={connectionStatus !== "connected" || !commandInput.trim() || isExecuting}
            className="btn btn-stream"
            title="Execute with real-time streaming output"
          >
            {isExecuting ? "Streaming..." : "Stream"}
          </button>
          <button type="button" onClick={clearResults} className="btn">
            Clear
          </button>
        </div>
      </div>

      <div className="results-container" ref={resultsEndRef}>
        {results.length === 0 ? (
          <div
            style={{ color: "#8b949e", padding: "2rem", textAlign: "center" }}
          >
            No commands executed yet. Try running a command above.
          </div>
        ) : (
          <div>
            {results.map((result) => (
              <div key={result.id} className="command-result">
                <div className="result-header">
                  <span className="status-icon">
                    {getStatusIcon(result.status)}
                  </span>
                  <div className="command-line">
                    ${" "}
                    <span>
                      {result.command} {result.args.join(" ")}
                    </span>
                  </div>
                  {result.status !== "running" &&
                    result.exitCode !== undefined && (
                      <span className="exit-code">
                        (exit: {result.exitCode})
                      </span>
                    )}
                  <span className="timestamp">
                    {result.timestamp.toLocaleTimeString()}
                  </span>
                </div>

                {result.stdout && (
                  <div className="stdout-output">
                    <pre>{result.stdout}</pre>
                  </div>
                )}

                {result.stderr && (
                  <div className="stderr-output">
                    <pre>{result.stderr}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="help-section">
        <h3>Example Commands</h3>
        <div className="help-grid">
          <div className="help-item">
            <span className="help-command">ls</span> - List files
          </div>
          <div className="help-item">
            <span className="help-command">pwd</span> - Print working directory
          </div>
          <div className="help-item">
            <span className="help-command">echo</span> - Print text
          </div>
          <div className="help-item">
            <span className="help-command">cat</span> - Display file contents
          </div>
          <div className="help-item">
            <span className="help-command">whoami</span> - Show current user
          </div>
          <div className="help-item">
            <span className="help-command">date</span> - Show current date/time
          </div>
        </div>
        <div className="help-note">
          <strong>Note:</strong> Use the "Stream" button for commands that
          produce real-time output (like <code>top</code> or{" "}
          <code>tail -f</code>).
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<REPL />);

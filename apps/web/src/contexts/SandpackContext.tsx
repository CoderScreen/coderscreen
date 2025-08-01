import {
	type ClientOptions,
	loadSandpackClient,
	type SandpackClient,
	type SandpackMessage,
} from "@codesandbox/sandpack-client";
import type React from "react";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useRoomContext } from "@/contexts/RoomContext";
import { debounce } from "@/lib/debounce";
import {
	getFrameworkTemplate,
	mergeFrameworkTemplate,
} from "@/lib/sandpack/frameworkTemplates";

// Constants for console functionality
const CLEAR_LOG = { id: "clear", method: "clear", data: [] };
const MAX_MESSAGE_COUNT = 100;
const SYNTAX_ERROR_PATTERN = [
	"SyntaxError:",
	"ReferenceError:",
	"TypeError:",
	"RangeError:",
	"EvalError:",
	"URIError:",
];

// Types for console data
export interface SandpackConsoleData {
	id: string;
	method: string;
	data: any[];
}

interface SandpackContextType {
	// Sandpack client related
	sandpackClient: SandpackClient | null;
	sandpackLoading: boolean;
	initializeSandpackClient: (iframe: HTMLIFrameElement) => Promise<void>;
	// Console related
	logs: SandpackConsoleData[];
	resetConsole: () => void;
}

const SandpackContext = createContext<SandpackContextType | undefined>(
	undefined,
);

interface SandpackProviderProps {
	children: ReactNode;
}

const SANDBOX_OPTIONS: ClientOptions = {
	showOpenInCodeSandbox: false,
	showErrorScreen: true,
	showLoadingScreen: true,
};

export const SandpackProvider: React.FC<SandpackProviderProps> = ({
	children,
}) => {
	const { provider } = useRoomContext();

	// Sandpack client state
	const [sandpackClient, setSandpackClient] = useState<SandpackClient | null>(
		null,
	);
	const [sandpackLoading, setSandpackLoading] = useState(false);

	// Console state
	const [logs, setLogs] = useState<SandpackConsoleData[]>([]);
	const consoleOptions = useMemo(
		() => ({
			maxMessageCount: MAX_MESSAGE_COUNT,
			showSyntaxError: false,
			resetOnPreviewRestart: true,
		}),
		[],
	);

	// observe code changes and update the sandpack client (debounced)
	// useEffect(() => {
	//   if (!sandpackClient) return;

	//   const debouncedUpdateSandbox = debounce((code: string) => {
	//     if (sandpackClient) {
	//       const newContent = mergeFrameworkTemplate(code, 'react');
	//       sandpackClient.updateSandbox(newContent);
	//     }
	//   }, 500);

	//   provider.doc.getText('code').observe((event) => {
	//     const code = event.target.toString();
	//     debouncedUpdateSandbox(code);
	//   });

	//   // Cleanup function to clear any pending debounced calls
	//   return () => {
	//     // The debounce function will handle cleanup internally
	//   };
	// }, [provider.doc, sandpackClient]);

	const handleConsoleMessage = useCallback(
		(message: SandpackMessage) => {
			if (consoleOptions.resetOnPreviewRestart && message.type === "start") {
				setLogs([]);
			} else if (message.type === "console" && message.codesandbox) {
				const payloadLog = Array.isArray(message.log)
					? message.log
					: [message.log];

				if (payloadLog.find(({ method }) => method === "clear")) {
					return setLogs([CLEAR_LOG]);
				}

				const logsMessages = consoleOptions.showSyntaxError
					? payloadLog
					: payloadLog.filter((messageItem) => {
							const messagesWithoutSyntaxErrors =
								messageItem?.data?.filter?.((dataItem) => {
									if (typeof dataItem !== "string") return true;

									const matches = SYNTAX_ERROR_PATTERN.filter((lookFor) =>
										dataItem.startsWith(lookFor),
									);

									return matches.length === 0;
								}) ?? [];

							return messagesWithoutSyntaxErrors.length > 0;
						});

				if (!logsMessages) return;

				setLogs((prev) => {
					const messages = [...prev, ...logsMessages].filter(
						(value, index, self) => {
							return index === self.findIndex((s) => s.id === value.id);
						},
					);

					while (messages.length > consoleOptions.maxMessageCount) {
						messages.shift();
					}

					return messages;
				});
			}
		},
		[consoleOptions],
	);

	// Initialize Sandpack client function
	const initializeSandpackClient = useCallback(
		async (iframe: HTMLIFrameElement) => {
			try {
				setSandpackLoading(true);
				const client = await loadSandpackClient(
					iframe,
					getFrameworkTemplate("react"),
					SANDBOX_OPTIONS,
				);

				client.listen((event) => {
					handleConsoleMessage(event);
					setSandpackClient(client);
				});

				setSandpackClient(client);
			} catch (error) {
				console.error("Failed to load Sandpack client:", error);
			} finally {
				setSandpackLoading(false);
			}
		},
		[handleConsoleMessage],
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
				initializeSandpackClient,
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
		throw new Error(
			"useSandpackContext must be used within a SandpackProvider",
		);
	}
	return context;
};

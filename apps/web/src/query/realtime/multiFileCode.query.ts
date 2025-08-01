import { EditorState } from "@codemirror/state";
import { basicSetup, EditorView } from "codemirror";
import { useCallback, useEffect, useRef, useState } from "react";
import { yCollab } from "y-codemirror.next";
import * as Y from "yjs";
import { useRoomContext } from "@/contexts/RoomContext";

// Track editor views and bindings per file
interface FileBinding {
	state: EditorState;
}

// Shared hook for creating collaborative multi-file code editor
export function useMultiFileCodeEditor(
	elementRef: React.RefObject<HTMLDivElement | null>,
) {
	const { provider, isReadOnly } = useRoomContext();
	const fileBindingsRef = useRef<Record<string, FileBinding>>({});
	const [selectedFile, _setSelectedFile] = useState<string | undefined>(
		undefined,
	);

	const editorViewRef = useRef<EditorView>(null);

	const fileMap = provider.doc.getMap<string>("files");
	const files = Array.from(fileMap.keys());

	const getOrCreateView = useCallback(
		(initialState: EditorState) => {
			const viewRef = editorViewRef.current;
			if (viewRef) return viewRef;

			if (!elementRef.current) return;

			const view = new EditorView({
				state: initialState,
				parent: elementRef.current,
			});

			editorViewRef.current = view;
			return view;
		},
		[elementRef],
	);

	// Create or get Y.Text for a specific file
	const getOrCreateEditorState = useCallback(
		(filePath: string) => {
			const ytext = provider.doc.getText(`file:${filePath}`);
			const undoManager = new Y.UndoManager(ytext);

			const state = EditorState.create({
				doc: ytext.toString(),
				extensions: [basicSetup, yCollab(ytext, null, { undoManager })],
			});

			return state;
		},
		[provider],
	);

	const switchToFile = useCallback(
		(filePath: string) => {
			const state = getOrCreateEditorState(filePath);

			const view = getOrCreateView(state);
			view?.setState(state);
		},
		[getOrCreateEditorState, getOrCreateView],
	);

	// Get file content
	const getFileContent = useCallback(
		(filePath: string): string => {
			const ytext = provider.doc.getText(`file:${filePath}`);
			return ytext.toString();
		},
		[provider],
	);

	// Create a new file
	const createFile = useCallback(
		(filePath: string, initialContent: string = "") => {
			const ytext = provider.doc.getText(`file:${filePath}`);
			ytext.insert(0, initialContent);
		},
		[provider],
	);

	// Delete a file
	const deleteFile = useCallback(
		(filePath: string) => {
			const ytext = provider.doc.getText(`file:${filePath}`);
			ytext.delete(0, ytext.length);
		},
		[provider],
	);

	// Rename a file
	const renameFile = useCallback(
		(oldPath: string, newPath: string) => {
			const oldYText = provider.doc.getText(`file:${oldPath}`);
			const newYText = provider.doc.getText(`file:${newPath}`);

			// Copy content from old to new
			const content = oldYText.toString();
			newYText.insert(0, content);

			// Clear old content
			oldYText.delete(0, oldYText.length);
		},
		[provider],
	);

	// #########################################################
	// CLEANUP FUNCTIONS
	// #########################################################

	useEffect(() => {
		return () => {
			editorViewRef.current?.destroy();
		};
	}, []);

	const setSelectedFile = useCallback(
		(filePath: string) => {
			_setSelectedFile(filePath);
			switchToFile(filePath);
		},
		[switchToFile],
	);

	const focusEditor = useCallback(() => {
		editorViewRef.current?.focus();
	}, []);

	return {
		createFile,
		deleteFile,
		renameFile,
		getFileContent,
		selectedFile,
		setSelectedFile,
		files,
		focusEditor,
	};
}

// Helper function to determine language from file path
function getLanguageFromPath(filePath: string): string {
	const ext = filePath.split(".").pop()?.toLowerCase();

	switch (ext) {
		case "js":
		case "jsx":
			return "javascript";
		case "ts":
		case "tsx":
			return "typescript";
		case "html":
			return "html";
		case "css":
			return "css";
		case "json":
			return "json";
		case "py":
			return "python";
		case "java":
			return "java";
		case "cpp":
		case "cc":
		case "cxx":
			return "cpp";
		case "c":
			return "c";
		case "php":
			return "php";
		case "rb":
			return "ruby";
		case "go":
			return "go";
		case "rs":
			return "rust";
		case "swift":
			return "swift";
		case "kt":
			return "kotlin";
		case "scala":
			return "scala";
		case "r":
			return "r";
		case "sql":
			return "sql";
		case "md":
			return "markdown";
		case "xml":
			return "xml";
		case "yaml":
		case "yml":
			return "yaml";
		default:
			return "plaintext";
	}
}

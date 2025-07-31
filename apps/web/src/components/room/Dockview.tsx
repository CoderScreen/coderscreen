import {
	RiChatAiLine,
	RiCodeLine,
	RiPencilLine,
	RiSlideshowLine,
	RiStickyNoteLine,
	RiTerminalLine,
} from "@remixicon/react";
import type {
	DockviewTheme,
	IDockviewPanelHeaderProps,
	IDockviewPanelProps,
} from "dockview";
import { useMemo } from "react";
import { AiChatView } from "@/components/room/ai-chat/AiChatView";
import { CodeOutput } from "@/components/room/CodeOutput";
import { CodeEditor } from "@/components/room/editor/CodeEditor";
import { InstructionEditor } from "@/components/room/tiptap/InstructionEditor";
import { NotesEditor } from "@/components/room/tiptap/NotesEditor";
import { WhiteboardView } from "@/components/room/whiteboard/WhiteboardView";
import { cx } from "@/lib/utils";

export const DOCKVIEW_PANEL_IDS = {
	CODE_EDITOR: "code-editor",
	INSTRUCTIONS: "instructions",
	CODE_OUTPUT: "code-output",
	WHITEBOARD: "whiteboard",
	AI_CHAT: "ai-chat",
	NOTES: "notes",
	TAB: "tab",
};

export const lightDockviewTheme: DockviewTheme = {
	name: "light",
	className: "dockview-theme-light",
};

// Common tab icons function
export const getTabIcon = (panelId: string) => {
	switch (panelId) {
		case DOCKVIEW_PANEL_IDS.CODE_EDITOR:
			return <RiCodeLine className="size-4" />;
		case DOCKVIEW_PANEL_IDS.INSTRUCTIONS:
			return <RiPencilLine className="size-4" />;
		case DOCKVIEW_PANEL_IDS.CODE_OUTPUT:
			return <RiTerminalLine className="size-4" />;
		case DOCKVIEW_PANEL_IDS.WHITEBOARD:
			return <RiSlideshowLine className="size-4" />;
		case DOCKVIEW_PANEL_IDS.AI_CHAT:
			return <RiChatAiLine className="size-4" />;
		case DOCKVIEW_PANEL_IDS.NOTES:
			return <RiStickyNoteLine className="size-4" />;
		default:
			return null;
	}
};

// Common components mapping
export const useDockviewComponents = (isGuest: boolean) =>
	useMemo(
		() => ({
			"code-editor": (_: IDockviewPanelProps) => (
				<div className="h-full">
					<CodeEditor />
				</div>
			),
			instructions: (_: IDockviewPanelProps) => (
				<div className="h-full overflow-y-auto">
					<InstructionEditor isGuest={isGuest} />
				</div>
			),
			"code-output": (_: IDockviewPanelProps) => (
				<div className="h-full overflow-y-auto">
					<CodeOutput />
				</div>
			),
			whiteboard: (_: IDockviewPanelProps) => (
				<div className="h-full overflow-y-auto">
					<WhiteboardView />
				</div>
			),
			"ai-chat": (_: IDockviewPanelProps) => (
				<div className="h-full overflow-y-auto">
					<AiChatView role={isGuest ? "guest" : "host"} />
				</div>
			),
			notes: (_: IDockviewPanelProps) => (
				<div className="h-full overflow-y-auto">
					<NotesEditor />
				</div>
			),
		}),
		[isGuest],
	);

// Common tab components
export const useTabComponents = () =>
	useMemo(
		() => ({
			tab: (props: IDockviewPanelHeaderProps) => (
				<div
					className={cx(
						"h-fit flex shrink-0 items-center gap-2 p-2 pt-1 text-sm font-medium transition-all",
						props.api.isFocused && "border-b-2 border-primary",
					)}
				>
					{getTabIcon(props.api.id)}
					<span className="truncate">{props.api.title}</span>
				</div>
			),
		}),
		[],
	);

import { Id } from "@coderscreen/common/id";

export const getSandboxId = (roomId: Id<"room">, language?: string) => {
	return `s_${roomId}`;
};

export interface ExecuteResponse {
	id: string;
	success: boolean;
	stdout: string;
	stderr: string;
	exitCode: number;
	command: string;
	args: string[];
	timestamp: string;
	elapsedTime: number;
}

export interface FormattedOutput {
	success: boolean;
	timestamp: string;
	stdout: string;
	stderr: string;
	exitCode: number;
	elapsedTime: number;
}

export const formatExecOutput = (
	output: void | ExecuteResponse
): FormattedOutput => {
	if (!output) {
		return {
			success: false,
			timestamp: new Date().toISOString(),
			stdout: "",
			stderr: "No output from execution",
			exitCode: 0,
			elapsedTime: 0,
		};
	}

	return {
		success: output.success,
		timestamp: output.timestamp,
		stdout: output.stdout,
		stderr: output.stderr,
		exitCode: output.exitCode,
		elapsedTime: output.elapsedTime,
	};
};

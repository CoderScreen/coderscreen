import { Id } from '@coderscreen/common/id';

export const getSandboxId = (roomId: Id<'room'>) => {
	return `s_${roomId}`;
};

export interface FormattedOutput {
	success: boolean;
	timestamp: string;
	stdout: string;
	stderr: string;
	exitCode: number;
	elapsedTime: number;
	compileTime?: number;
}

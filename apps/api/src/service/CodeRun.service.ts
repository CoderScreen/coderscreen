import { AppContext } from '..';
import { Daytona } from '@daytonaio/sdk';
import { Id } from '@coderscreen/common/id';
import { Context } from 'hono';

const DAYTONA_API_KEY = process.env.DAYTONA_API_KEY;
if (!DAYTONA_API_KEY) {
	throw new Error('DAYTONA_API_KEY is not set');
}

// Initialize the Daytona client
const daytona = new Daytona({
	apiKey: DAYTONA_API_KEY,
	serverUrl: 'https://app.daytona.io/api',
	target: 'us',
});

export class CodeRunService {
	constructor(ctx: Context<AppContext>) {}

	async runCode(params: { roomId: Id<'room'>; code: string }) {
		const { roomId, code } = params;

		const sandbox = await daytona.create({
			language: 'typescript',
		});

		// Run the code securely inside the Sandbox
		// const response = await sandbox.process.codeRun('console.log("Hello World from code!")');
		// console.log(response.result);

		return sandbox;
	}
}

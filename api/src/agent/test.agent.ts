import { Agent as CFAgent } from 'agents';
import { Agent, run } from '@openai/agents';
import { AppContext } from '..';

export class TestAgent extends CFAgent<AppContext> {
	async onRequest() {
		const agent = new Agent({
			name: 'Assistant',
			instructions: 'You are a helpful assistant.',
		});

		const result = await run(agent, 'Write a haiku about recursion in programming.');
		return new Response(result.finalOutput);
	}
}

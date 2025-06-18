import { Hono } from 'hono';
import { TestAgent } from './agent/test.agent';
import { getAgentByName, routeAgentRequest } from 'agents';

export interface AppContext {
	Bindings: {
		TestAgent: DurableObjectNamespace<TestAgent>;
	};
}

const app = new Hono<AppContext>();

app.get('/', async (ctx) => {
	// let namedAgent = await getAgentByName<AppContext, TestAgent>(ctx.env.TestAgent, 'my-unique-agent-id');
	// // Pass the incoming request straight to your Agent
	// let result = await namedAgent.fetch(ctx.req.raw);
	// const resultCopy = result?.clone();

	// const body = await resultCopy?.json();
	// console.log('body', body);

	// return ctx.json(result);
	return ctx.json({ message: 'Hello, World!' });
});

export { TestAgent };
export default app;

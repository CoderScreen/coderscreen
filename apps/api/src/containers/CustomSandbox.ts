import { Sandbox } from '@cloudflare/sandbox';
import { getContainer } from '@cloudflare/containers';
import { AppContext } from '@/index';

export class CustomSandbox extends Sandbox<AppContext['Bindings']> {
	defaultPort = 3000; // Port the container is listening on
	sleepAfter = '1h'; // Stop the instance if requests not sent for 1h
}

export const getSandbox = (ns: DurableObjectNamespace<CustomSandbox>, id: string) => {
	return getContainer(ns, id);
};

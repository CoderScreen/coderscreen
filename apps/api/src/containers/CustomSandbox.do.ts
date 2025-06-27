import { type ContainerOptions, getContainer } from '@cloudflare/containers';
import { Sandbox as SandboxBase } from '@cloudflare/sandbox';
import { createClient } from '@cloudflare/sandbox/client';

export class Sandbox extends SandboxBase {
	constructor(state: DurableObjectState, env: Env, options: ContainerOptions) {
		super(state, env, options);
		this.client = createClient({
			baseUrl: `http://localhost:${this.defaultPort}`,
			stub: this,
			port: this.defaultPort,
		});
	}

	containerFetch(requestOrUrl: Request | string | URL, portOrInit?: number | RequestInit, portParam?: number): Promise<Response> {
		// HOTFIX: Fix request URLs that don't start with http, add http://localhost:3000

		let finalRequestOrUrl = requestOrUrl;

		if (finalRequestOrUrl instanceof Request) {
			finalRequestOrUrl.url = finalRequestOrUrl.url.startsWith('http')
				? finalRequestOrUrl.url
				: `http://localhost:${this.defaultPort}${finalRequestOrUrl.url}`;
		} else if (typeof finalRequestOrUrl === 'string') {
			finalRequestOrUrl = finalRequestOrUrl.startsWith('http')
				? finalRequestOrUrl
				: `http://localhost:${this.defaultPort}${finalRequestOrUrl}`;
		}

		return super.containerFetch(finalRequestOrUrl, portOrInit, portParam);
	}
}

export const getSandbox = async (ns: DurableObjectNamespace<Sandbox>, id: string) => {
	return getContainer(ns, id);
};

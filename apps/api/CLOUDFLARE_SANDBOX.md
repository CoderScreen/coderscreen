# Cloudflare Sandbox Integration

This project uses Cloudflare Sandboxes to securely execute untrusted, LLM-written code in a containerized environment.

## Overview

Cloudflare Sandboxes provide a secure way to run code in isolated containers, making them perfect for:

- Code interview platforms
- Online code editors
- AI-powered code generation tools
- Educational coding environments

## Configuration

### 1. Wrangler Configuration

The sandbox is configured in `wrangler.jsonc`:

```json
{
	"containers": [
		{
			"class_name": "Sandbox",
			"image": "./Dockerfile",
			"name": "sandbox",
			"max_instances": 1
		}
	],
	"durable_objects": {
		"bindings": [
			{
				"class_name": "Sandbox",
				"name": "Sandbox"
			}
		]
	}
}
```

### 2. Environment Types

The sandbox is available in the environment bindings:

```typescript
interface AppContext {
	Bindings: {
		SANDBOX: DurableObjectNamespace<Sandbox>;
		// ... other bindings
	};
}
```

## Usage

### Basic Code Execution

```typescript
import { getSandbox } from '@cloudflare/sandbox';

const sandbox = getSandbox(env.SANDBOX, 'unique-sandbox-id');

// Write code to a file
await sandbox.writeFile('script.js', 'console.log("Hello World!");', { encoding: 'utf8' });

// Execute the code
const result = await sandbox.exec('node', ['script.js']);

// Clean up
await sandbox.deleteFile('script.js', {});

// Handle the result
if (result && typeof result === 'object' && 'stdout' in result) {
	console.log('Output:', result.stdout);
	console.log('Exit code:', result.exitCode);
	console.log('Errors:', result.stderr);
}
```

### Supported Programming Languages

The `CodeRunService` supports multiple programming languages:

| Language   | File Extension | Command   |
| ---------- | -------------- | --------- |
| JavaScript | `.js`          | `node`    |
| TypeScript | `.ts`          | `ts-node` |
| Python     | `.py`          | `python3` |
| PHP        | `.php`         | `php`     |
| Ruby       | `.rb`          | `ruby`    |
| Java       | `.java`        | `java`    |
| C++        | `.cpp`         | `g++`     |
| C          | `.c`           | `gcc`     |
| Rust       | `.rs`          | `rustc`   |
| Go         | `.go`          | `go`      |
| Swift      | `.swift`       | `swift`   |
| Kotlin     | `.kt`          | `kotlin`  |
| Scala      | `.scala`       | `scala`   |

### Using the CodeRunService

```typescript
import { CodeRunService } from './services/CodeRun.service';

const codeRunService = new CodeRunService(ctx);

// Run JavaScript code
const result = await codeRunService.runCode({
	roomId: 'room-123',
	code: 'console.log("Hello from JavaScript!");',
	language: 'javascript',
});

// Run Python code
const pythonResult = await codeRunService.runCode({
	roomId: 'room-123',
	code: 'print("Hello from Python!")',
	language: 'python',
});

// Run example code in multiple languages
const examples = await codeRunService.runExampleCode('room-123');
```

## Sandbox Methods

### File Operations

- `writeFile(path: string, content: string, options?: { encoding?: string; stream?: boolean })`
- `readFile(path: string, options?: { encoding?: string; stream?: boolean })`
- `deleteFile(path: string, options?: { stream?: boolean })`
- `renameFile(oldPath: string, newPath: string, options?: { stream?: boolean })`
- `moveFile(sourcePath: string, destinationPath: string, options?: { stream?: boolean })`
- `mkdir(path: string, options?: { recursive?: boolean; stream?: boolean })`

### Execution

- `exec(command: string, args: string[], options?: { stream?: boolean })`
- `ping()` - Test sandbox connectivity

### Git Operations

- `gitCheckout(repoUrl: string, options: { branch?: string; targetDir?: string; stream?: boolean })`

## Security Features

1. **Isolation**: Each sandbox runs in its own container
2. **Resource Limits**: Configurable CPU and memory limits
3. **Network Isolation**: Controlled network access
4. **File System Isolation**: Temporary file system per execution
5. **Process Isolation**: Each execution runs in a separate process

## Best Practices

1. **Always Clean Up**: Delete temporary files after execution
2. **Handle Errors**: Properly catch and handle execution errors
3. **Resource Management**: Monitor and limit resource usage
4. **Input Validation**: Validate code before execution
5. **Timeout Handling**: Set appropriate timeouts for long-running code

## Example: Complete Code Execution Flow

```typescript
async function executeCode(code: string, language: string, roomId: string) {
	const sandbox = getSandbox(env.SANDBOX, roomId);

	try {
		// 1. Create a unique filename
		const fileName = `code_${Date.now()}.${getFileExtension(language)}`;

		// 2. Write code to sandbox
		await sandbox.writeFile(fileName, code, { encoding: 'utf8' });

		// 3. Execute the code
		const command = getExecutionCommand(language);
		const result = await sandbox.exec(command, [fileName]);

		// 4. Clean up
		await sandbox.deleteFile(fileName, {});

		// 5. Process results
		if (result && typeof result === 'object' && 'stdout' in result) {
			return {
				success: true,
				output: result.stdout,
				error: result.stderr,
				exitCode: result.exitCode,
			};
		}

		return { success: false, error: 'Execution failed' };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		};
	}
}
```

## Troubleshooting

### Common Issues

1. **Sandbox not available**: Ensure the sandbox is properly configured in wrangler.jsonc
2. **Command not found**: Verify the programming language runtime is available in the sandbox
3. **Permission denied**: Check file permissions and sandbox configuration
4. **Timeout errors**: Increase timeout limits or optimize code execution

### Debugging

- Use `sandbox.ping()` to test connectivity
- Check sandbox logs in the Cloudflare dashboard
- Monitor resource usage and limits
- Verify file operations with `sandbox.readFile()`

## Resources

- [Cloudflare Sandbox Documentation](https://developers.cloudflare.com/workers/runtime-apis/sandbox/)
- [Wrangler Configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Durable Objects](https://developers.cloudflare.com/workers/runtime-apis/durable-objects/)

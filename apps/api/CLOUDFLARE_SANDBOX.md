# Cloudflare Sandbox Integration

This document describes how to use the Cloudflare Sandbox for secure code execution in the CodeInterview application.

## Overview

The Cloudflare Sandbox provides a secure, isolated environment for running user-submitted code. It supports multiple programming languages and provides process isolation, resource limits, and timeout protection.

## Configuration

### 1. Wrangler Configuration

Add the sandbox to your `wrangler.jsonc`:

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

## Security Features

1. **Isolation**: Each sandbox runs in its own container
2. **Resource Limits**: Configurable CPU and memory limits
3. **Network Isolation**: Controlled network access
4. **File System Isolation**: Temporary file system per execution
5. **Process Isolation**: Each execution runs in a separate process
6. **Timeout Protection**: Automatic termination of long-running code (5 seconds)

## Timeout Protection

The sandbox includes built-in timeout protection to prevent infinite loops and long-running code from consuming resources indefinitely.

### How It Works

- **Default Timeout**: 5 seconds for all code execution
- **Automatic Detection**: Uses `Promise.race()` to detect timeouts
- **Graceful Handling**: Returns a timeout response instead of hanging
- **Process Cleanup**: Attempts to terminate timed-out processes

### Timeout Response

When a timeout occurs, the sandbox returns:

```typescript
{
	success: false,
	stdout: '',
	stderr: 'Execution timed out after 5000ms. This may be due to an infinite loop or long-running code.',
	exitCode: -1, // Special exit code for timeout
	command: 'python',
	args: ['script.py'],
	timestamp: '2024-01-01T00:00:00.000Z'
}
```

### Example: Handling Timeouts

```typescript
const result = await sandbox.runCode({
	language: 'python',
	code: 'while True: print("infinite loop")',
});

if (result.exitCode === -1 && result.stderr.includes('timed out')) {
	console.log('Code execution timed out - possible infinite loop detected');
} else {
	console.log('Code executed successfully:', result.stdout);
}
```

## Best Practices

1. **Always Clean Up**: Delete temporary files after execution
2. **Handle Errors**: Properly catch and handle execution errors
3. **Resource Management**: Monitor and limit resource usage
4. **Input Validation**: Validate code before execution
5. **Timeout Handling**: Set appropriate timeouts for long-running code
6. **Timeout Detection**: Check for timeout responses in your application logic

## Example: Complete Code Execution Flow

```typescript
async function executeCode(code: string, language: string, roomId: string) {
	const sandbox = getSandbox(env.SANDBOX, roomId);

	try {
		// 1. Create a unique filename
		const fileName = `code_${Date.now()}.${getFileExtension(language)}`;

		// 2. Write code to sandbox
		await sandbox.writeFile(fileName, code, { encoding: 'utf8' });

		// 3. Execute the code (with automatic timeout protection)
		const command = getExecutionCommand(language);
		const result = await sandbox.exec(command, [fileName]);

		// 4. Clean up
		await sandbox.deleteFile(fileName, {});

		// 5. Process results
		if (result && typeof result === 'object' && 'stdout' in result) {
			// Check for timeout
			if (result.exitCode === -1 && result.stderr.includes('timed out')) {
				return {
					success: false,
					output: '',
					error: 'Code execution timed out - possible infinite loop detected',
					exitCode: -1,
				};
			}

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
5. **Infinite loops**: The timeout protection should catch these automatically

### Debugging

- Use `sandbox.ping()` to test connectivity
- Check sandbox logs in the Cloudflare dashboard
- Monitor resource usage and limits
- Verify file operations with `sandbox.readFile()`
- Check for timeout responses in execution results

## Resources

- [Cloudflare Sandbox Documentation](https://developers.cloudflare.com/workers/runtime-apis/sandbox/)
- [Wrangler Configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Durable Objects](https://developers.cloudflare.com/workers/runtime-apis/durable-objects/)

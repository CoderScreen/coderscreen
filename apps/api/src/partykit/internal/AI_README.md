# AI Service Documentation

## Overview

The AI Service is a comprehensive multi-user AI chat application with streaming capabilities that integrates seamlessly with Y.js documents for real-time collaboration. It provides a complete chat interface with AI responses, message management, and configuration options.

## Features

### Core Functionality
- **Multi-user chat**: Support for multiple users in the same room
- **Real-time streaming**: AI responses stream in real-time to all connected users
- **Y.js integration**: All chat data is synchronized across all connected clients
- **Message management**: Add, edit, delete, and clear messages
- **AI configuration**: Customizable AI model settings
- **Error handling**: Robust error handling for streaming and API failures

### Chat Features
- User and assistant messages
- Message timestamps and user information
- Streaming indicators
- Message editing and deletion
- Chat history export
- Conversation summaries

### AI Configuration
- Model selection (GPT-4, GPT-3.5-turbo, etc.)
- Temperature control
- Max tokens limit
- Custom system prompts

## Architecture

### Y.js Document Structure

The AI service uses the following Y.js document structure:

```typescript
// Chat messages array
document.getArray('chatMessages') // Array of ChatMessage objects

// AI configuration map
document.getMap('aiConfig') // Contains model, temperature, maxTokens, systemPrompt

// Streaming state map
document.getMap('streamingState') // Tracks current streaming status
```

### ChatMessage Interface

```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  userId?: string;
  userName?: string;
  isStreaming?: boolean;
  streamingId?: string;
}
```

## Usage

### Basic Setup

```typescript
import { AIService } from './internal/AI.service';

// Initialize the AI service
const aiService = new AIService(env, document, roomId);
aiService.initializeChat();
```

### Adding Messages

```typescript
// Add a user message
const messageId = aiService.addUserMessage(
  "Hello, can you help me with this code?",
  "user123",
  "John Doe"
);

// Add an assistant message
aiService.addAssistantMessage("I'd be happy to help!");
```

### Streaming AI Responses

```typescript
// Start streaming an AI response
const streamingId = await aiService.startStreamingResponse(messageId, "user123");

// The AI service will automatically:
// 1. Create an assistant message
// 2. Stream the response in real-time
// 3. Update the message as content arrives
// 4. Mark the message as complete when done
```

### Configuration Management

```typescript
// Get current AI configuration
const config = aiService.getAIConfig();

// Update AI configuration
aiService.updateAIConfig({
  model: 'gpt-4',
  temperature: 0.8,
  maxTokens: 1500,
  systemPrompt: 'You are a helpful coding assistant.'
});
```

### Message Management

```typescript
// Get all chat messages
const messages = aiService.getChatMessages();

// Edit a message
aiService.editMessage(messageId, "Updated content");

// Delete a message
aiService.deleteMessage(messageId);

// Clear all messages
aiService.clearChat();
```

### Streaming Status

```typescript
// Check if currently streaming
const isStreaming = aiService.isStreaming();

// Get streaming information
const streamingInfo = aiService.getStreamingInfo();
// Returns: { streamingId, userMessageId, userId } | null
```

### Export and Summary

```typescript
// Get conversation summary
const summary = aiService.getConversationSummary();

// Export complete chat history
const exportData = aiService.exportChatHistory();
// Returns: { messages, config, summary }
```

## Integration with RoomServer

The AI service is integrated into the RoomServer class and provides public methods for handling chat operations:

```typescript
// Handle a user message and start AI response
const messageId = await roomServer.handleUserMessage(
  "Hello AI!",
  "user123",
  "John Doe"
);

// Get chat messages
const messages = await roomServer.getChatMessages();

// Update AI configuration
await roomServer.updateAIConfig({
  model: 'gpt-4',
  temperature: 0.7
});

// Check streaming status
const isStreaming = await roomServer.isStreaming();
```

## Environment Configuration

### Required Environment Variables

Add the following to your environment configuration:

```typescript
// In worker-configuration.d.ts
interface Env {
  OPENAI_API_KEY: string;
  // ... other environment variables
}
```

### Setting up OpenAI API Key

1. Get an OpenAI API key from https://platform.openai.com/
2. Add it to your environment variables:
   ```bash
   # For local development
   export OPENAI_API_KEY="your-api-key-here"
   
   # For Cloudflare Workers
   # Add via wrangler.toml or Cloudflare dashboard
   ```

## Error Handling

The AI service includes comprehensive error handling:

### Streaming Errors
- Network failures are caught and displayed to users
- Invalid API responses are handled gracefully
- Timeout errors are managed appropriately

### Message Errors
- Invalid message IDs are handled safely
- Database errors are logged and reported
- Y.js synchronization errors are managed

### Configuration Errors
- Invalid configuration values are validated
- Missing API keys are detected early
- Malformed requests are prevented

## Performance Considerations

### Memory Management
- Messages are stored in Y.js arrays for efficient access
- Streaming state is managed in a separate map
- Large conversations are handled efficiently

### Network Optimization
- Streaming responses use efficient chunked transfer
- API requests are optimized for minimal latency
- Connection pooling is utilized where possible

### Scalability
- Multiple users can connect to the same room
- AI responses are synchronized across all clients
- Room isolation prevents cross-contamination

## Security

### API Key Management
- API keys are stored securely in environment variables
- Keys are never exposed to client-side code
- Access is restricted to server-side operations

### User Data Protection
- User IDs are optional and can be anonymized
- Message content is stored in the shared document
- No sensitive data is logged or exposed

### Rate Limiting
- Consider implementing rate limiting for AI requests
- Monitor API usage to prevent abuse
- Set appropriate timeouts for streaming responses

## Troubleshooting

### Common Issues

1. **API Key Not Found**
   - Ensure OPENAI_API_KEY is set in environment
   - Check that the key is valid and has sufficient credits

2. **Streaming Not Working**
   - Verify network connectivity
   - Check API response format
   - Ensure proper error handling is in place

3. **Messages Not Syncing**
   - Verify Y.js document structure
   - Check for transaction conflicts
   - Ensure proper initialization

4. **Performance Issues**
   - Monitor message array size
   - Consider implementing pagination for large chats
   - Optimize AI configuration for your use case

### Debugging

```typescript
// Enable debug logging
console.log('AI Service initialized');
console.log('Streaming state:', aiService.isStreaming());
console.log('Chat messages:', aiService.getChatMessages());
```

## Future Enhancements

### Planned Features
- Message reactions and emojis
- File upload support for code snippets
- Advanced AI model selection
- Conversation threading
- Message search functionality
- Custom AI personalities

### Integration Opportunities
- Code execution integration with SandboxService
- Whiteboard integration for visual explanations
- Template system for common AI prompts
- Analytics and usage tracking

## API Reference

### AIService Class

#### Constructor
```typescript
constructor(env: AppContext['Bindings'], document: Y.Doc, roomId: Id<'room'>)
```

#### Methods

- `initializeChat()`: Initialize chat structures in Y.js document
- `addUserMessage(content, userId?, userName?)`: Add user message
- `addAssistantMessage(content, messageId?)`: Add assistant message
- `startStreamingResponse(userMessageId, userId?)`: Start AI streaming
- `getChatMessages()`: Get all chat messages
- `getAIConfig()`: Get AI configuration
- `updateAIConfig(config)`: Update AI configuration
- `isStreaming()`: Check streaming status
- `getStreamingInfo()`: Get streaming information
- `clearChat()`: Clear all messages
- `deleteMessage(messageId)`: Delete specific message
- `editMessage(messageId, newContent)`: Edit message
- `getConversationSummary()`: Get conversation summary
- `exportChatHistory()`: Export complete chat history

### RoomServer Integration

#### AI Chat Methods
- `handleUserMessage(content, userId?, userName?)`: Handle user message
- `getChatMessages()`: Get chat messages
- `getAIConfig()`: Get AI configuration
- `updateAIConfig(config)`: Update AI configuration
- `clearChat()`: Clear chat
- `deleteMessage(messageId)`: Delete message
- `editMessage(messageId, newContent)`: Edit message
- `isStreaming()`: Check streaming status
- `getStreamingInfo()`: Get streaming info
- `exportChatHistory()`: Export chat history 
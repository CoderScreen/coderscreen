# Durable Objects - Collaborative Rooms

This directory contains the durable object for handling collaborative editing sessions.

## Structure

### Unified Room (`room.do.ts`)

The main room implementation that handles both code and instruction documents in a single durable object.

**Features:**

- Manages both code and instruction documents simultaneously
- Routes WebSocket messages to appropriate document based on `documentType` field
- Provides separate reset endpoints for each document type

**Endpoints:**

- `/` - Room information
- `/status` - Room status
- `/code/reset` - Reset code document only
- `/instructions/reset` - Reset instructions document only
- `/reset` - Reset both documents

### Supporting Files

- `collaboration-manager.ts` - Manages Y.js document collaboration
- `types.ts` - TypeScript type definitions

## Usage

### WebSocket Messages

When connecting to a unified room, include a `documentType` field in your messages to specify which document you want to work with:

```javascript
// For code document
{
  type: 'sync',
  documentType: 'code'
}

// For instructions document
{
  type: 'sync',
  documentType: 'instructions'
}
```

### Creating Rooms

Import and instantiate the UnifiedRoom directly:

```typescript
import { UnifiedRoom } from './durable-objects';

const room = new UnifiedRoom(state, env);
await room.initialize();
```

## Architecture

The unified room uses two separate `CollaborationManager` instances - one for code documents and one for instruction documents. This allows for independent management of each document type while sharing the same durable object instance for efficiency.

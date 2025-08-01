import { RoomSchema } from '@coderscreen/api/schema/room';

type WorkspaceTemplate = {
  path: string;
  code: string;
  isFolder?: boolean;
}[];

export const REACT_WORKSPACE_TEMPLATE: WorkspaceTemplate = [
  {
    path: '/package.json',
    code: JSON.stringify({
      name: 'react-workspace',
      main: 'src/index.js',
      dependencies: {
        react: 'latest',
        'react-dom': 'latest',
      },
    }),
  },
  {
    path: '/public',
    isFolder: true,
    code: '',
  },
  {
    path: '/public/index.html',
    code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>React Workspace</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`,
  },
  {
    path: '/src',
    isFolder: true,
    code: '',
  },
  {
    path: '/src/index.js',
    code: `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
`,
  },
  {
    path: '/src/App.js',
    code: `import React from "react";

export default function App() {
  return (
    <div>
      <h1>React Workspace</h1>
      <p>This is a React workspace template.</p>
      <button onClick={() => console.log("Hello from workspace!")}>
        Click me to log
      </button>
    </div>
  );
}
`,
  },
  {
    path: '/src/components',
    isFolder: true,
    code: '',
  },
  {
    path: '/src/components/Header.js',
    code: `import React from "react";

export default function Header() {
  return (
    <header style={{ padding: '1rem', backgroundColor: '#f0f0f0' }}>
      <h2>Workspace Header</h2>
    </header>
  );
}
`,
  },
  {
    path: '/src/styles',
    isFolder: true,
    code: '',
  },
  {
    path: '/src/styles/main.css',
    code: `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
`,
  },
  {
    path: '/README.md',
    code: `# React Workspace

This is a React workspace template with a basic file structure.

## Structure

- \`src/\` - Source files
  - \`components/\` - React components
  - \`styles/\` - CSS files
- \`public/\` - Static assets

## Getting Started

The app is already set up and ready to run!
`,
  },
];

export const getWorkspaceTemplate = (workspaceType: RoomSchema['language']): WorkspaceTemplate => {
  switch (workspaceType) {
    case 'react':
      return REACT_WORKSPACE_TEMPLATE;
    default:
      return [];
  }
};

import { RoomSchema } from '@coderscreen/api/schema/room';

type WorkspaceTemplate = {
  path: string;
  code: string;
  isFolder?: boolean;
}[];

export const REACT_WORKSPACE_TEMPLATE: WorkspaceTemplate = [
  {
    path: '/package.json',
    code: JSON.stringify(
      {
        name: 'react-workspace',
        main: 'src/index.tsx',
        dependencies: {
          react: 'latest',
          'react-dom': 'latest',
          '@types/react': 'latest',
          '@types/react-dom': 'latest',
          typescript: 'latest',
        },
      },
      null,
      2
    ),
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
    path: '/src/index.tsx',
    code: `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

const root = createRoot(rootElement);
root.render(<App />);
`,
  },
  {
    path: '/src/App.tsx',
    code: `import React from "react";
import Header from "./components/Header";
import "./styles/main.css";

const App: React.FC = () => {
  const handleClick = (): void => {
    console.log("Hello from workspace!");
  };

  return (
    <div className="container">
      <Header />
      <main>
        <h1>React Workspace</h1>
        <p>This is a React workspace template.</p>
        <button onClick={handleClick}>
          Click me to log
        </button>
      </main>
    </div>
  );
};

export default App;
`,
  },
  {
    path: '/src/components',
    isFolder: true,
    code: '',
  },
  {
    path: '/src/components/Header.tsx',
    code: `import React from "react";

const Header: React.FC = () => {
  return (
    <header style={{ padding: '1rem', backgroundColor: '#f0f0f0' }}>
      <h2>Workspace Header</h2>
    </header>
  );
};

export default Header;
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
    path: '/tsconfig.json',
    code: JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: 'react-jsx',
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true,
        },
        include: ['src'],
        references: [{ path: './tsconfig.node.json' }],
      },
      null,
      2
    ),
  },
  {
    path: '/tsconfig.node.json',
    code: JSON.stringify(
      {
        compilerOptions: {
          composite: true,
          skipLibCheck: true,
          module: 'ESNext',
          moduleResolution: 'bundler',
          allowSyntheticDefaultImports: true,
        },
        include: ['vite.config.ts'],
      },
      null,
      2
    ),
  },
  {
    path: '/README.md',
    code: `# React TypeScript Workspace

This is a React workspace template with TypeScript and a basic file structure.

## Structure

- \`src/\` - Source files
  - \`components/\` - React components
  - \`styles/\` - CSS files
- \`public/\` - Static assets

## Getting Started

The app is already set up and ready to run with TypeScript support!
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

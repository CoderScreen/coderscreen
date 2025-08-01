import { SandboxSetup } from '@codesandbox/sandpack-client';

export const REACT_WORKSPACE_TEMPLATE: SandboxSetup = {
  files: {
    '/package.json': {
      code: JSON.stringify({
        name: 'react-workspace',
        main: 'src/index.js',
        dependencies: {
          react: 'latest',
          'react-dom': 'latest',
        },
      }),
    },
    '/public/index.html': {
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
    '/src/index.js': {
      code: `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
`,
    },
    '/src/App.js': {
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
  },
  template: 'create-react-app',
};

export const getWorkspaceTemplate = (workspaceType: 'react' = 'react') => {
  switch (workspaceType) {
    case 'react':
      return REACT_WORKSPACE_TEMPLATE;
    default:
      throw new Error(`Unsupported workspace type: ${workspaceType}`);
  }
};

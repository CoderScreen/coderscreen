import { RoomSchema } from '@coderscreen/api/schema/room';
import { SandboxSetup } from '@codesandbox/sandpack-client';
import * as Y from 'yjs';

export const REACT_FRAMEWORK_TEMPLATE: SandboxSetup = {
  files: {
    '/package.json': {
      code: JSON.stringify({
        name: 'basic-react-app',
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
    <title>Basic React App</title>
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
      <h1>Hello, React!</h1>
      <p>This is a basic React app running in Sandpack.</p>
      <button onClick={() => console.log("Hello from console!")}>
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

export const getFrameworkTemplate = (framework: RoomSchema['language']) => {
  switch (framework) {
    case 'react':
      return REACT_FRAMEWORK_TEMPLATE;
    default:
      throw new Error(`Unsupported framework: ${framework}`);
  }
};

export const mergeFrameworkTemplate = (yDoc: Y.Doc, framework: RoomSchema['language']) => {
  // get fs from yDoc
  const fs = yDoc.getMap<string>('files');

  // merge the entries
  const newEntries = Object.entries(fs).map(([key, value]) => {
    return {
      [key]: {
        ...value,
      },
    };
  });

  const frameworkTemplate = getFrameworkTemplate(framework);
  return {
    ...frameworkTemplate,
    files: {
      ...frameworkTemplate.files,
      ...newEntries,
    },
  };
};

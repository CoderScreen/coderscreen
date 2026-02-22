import { WorkspaceTemplate } from '@/components/room/editor/lib/languageTemplate';

export const REACT_WORKSPACE_TEMPLATE: WorkspaceTemplate = [
  {
    path: '/package.json',
    code: JSON.stringify(
      {
        name: 'react-workspace',
        private: true,
        type: 'module',
        main: 'src/index.tsx',
        scripts: {
          dev: 'vite',
        },
        dependencies: {
          react: '^19.0.0',
          'react-dom': '^19.0.0',
        },
        devDependencies: {
          '@types/react': '^19.0.0',
          '@types/react-dom': '^19.0.0',
          '@vitejs/plugin-react': '^4.0.0',
          typescript: '^5.0.0',
          vite: '^6.0.0',
        },
      },
      null,
      2
    ),
  },
  {
    path: '/index.html',
    code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>
`,
  },
  {
    path: '/vite.config.ts',
    code: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { allowedHosts: true },
})
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
    code: `import React, { useState } from "react";

const App: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Hello React!</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
};

export default App;
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
];

export const VUEJS_WORKSPACE_TEMPLATE: WorkspaceTemplate = [
  {
    path: '/package.json',
    code: JSON.stringify({
      name: 'vue-app',
      version: '0.1.0',
      private: true,
      main: 'src/main.ts',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vue-tsc && vite build',
        preview: 'vite preview',
      },
      dependencies: {
        vue: '^3.3.0',
      },
      devDependencies: {
        '@vitejs/plugin-vue': '^4.2.0',
        typescript: '^5.0.0',
        'vue-tsc': '^1.2.0',
        vite: '^4.3.0',
      },
    }),
  },
  {
    path: '/index.html',
    code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vue App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`,
  },
  {
    path: '/vite.config.ts',
    code: `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: { allowedHosts: true },
})
`,
  },
  {
    path: '/tsconfig.json',
    code: JSON.stringify({
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
        jsx: 'preserve',
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
      },
      include: ['src/**/*.ts', 'src/**/*.d.ts', 'src/**/*.tsx', 'src/**/*.vue'],
      references: [{ path: './tsconfig.node.json' }],
    }),
  },
  {
    path: '/tsconfig.node.json',
    code: JSON.stringify({
      compilerOptions: {
        composite: true,
        skipLibCheck: true,
        module: 'ESNext',
        moduleResolution: 'bundler',
        allowSyntheticDefaultImports: true,
      },
      include: ['vite.config.ts'],
    }),
  },
  {
    path: '/src',
    isFolder: true,
    code: '',
  },
  {
    path: '/src/main.ts',
    code: `import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')
`,
  },
  {
    path: '/src/App.vue',
    code: `<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div class="app">
    <h1>Hello Vue!</h1>
    <p>Count: {{ count }}</p>
    <button @click="count++">
      Click me
    </button>
  </div>
</template>

<style scoped>
.app {
  padding: 20px;
  text-align: center;
}
</style>
`,
  },
  {
    path: '/src/style.css',
    code: `:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  color: white;
  cursor: pointer;
  transition: border-color 0.25s;
}

button:hover {
  border-color: #646cff;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  button {
    background-color: #f9f9f9;
    color: #213547;
  }
}
`,
  },
  {
    path: '/src/vite-env.d.ts',
    code: `/// <reference types="vite/client" />
`,
  },
];

export const SVELTE_WORKSPACE_TEMPLATE: WorkspaceTemplate = [
  {
    path: '/package.json',
    code: JSON.stringify(
      {
        name: 'svelte-app',
        private: true,
        type: 'module',
        scripts: {
          dev: 'vite',
        },
        devDependencies: {
          '@sveltejs/vite-plugin-svelte': '^5.0.0',
          svelte: '^5.0.0',
          vite: '^6.0.0',
        },
      },
      null,
      2
    ),
  },
  {
    path: '/index.html',
    code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Svelte App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`,
  },
  {
    path: '/vite.config.ts',
    code: `import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  server: { allowedHosts: true },
})
`,
  },
  {
    path: '/svelte.config.js',
    code: `import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

export default {
  preprocess: vitePreprocess(),
}
`,
  },
  {
    path: '/src',
    isFolder: true,
    code: '',
  },
  {
    path: '/src/main.ts',
    code: `import App from './App.svelte'
import './styles.css'

const app = new App({
  target: document.getElementById('app')!,
})

export default app
`,
  },
  {
    path: '/src/App.svelte',
    code: `<script>
  let count = $state(0);
</script>

<main>
  <h1>Hello Svelte!</h1>
  <p>Count: {count}</p>
  <button onclick={() => count++}>
    Click me
  </button>
</main>

<style>
  main {
    text-align: center;
    padding: 20px;
  }
</style>
`,
  },
  {
    path: '/src/styles.css',
    code: `body {
  margin: 0;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1 {
  color: #333;
  margin-bottom: 20px;
}
`,
  },
];

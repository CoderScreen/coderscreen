import { createFileRoute } from '@tanstack/react-router';
import logo from '../logo.svg';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/')({
  component: App,
});

function App() {
  return (
    <div className='App'>
      <header className='App-header'>
        <img src={logo} className='App-logo' alt='logo' />

        <Button className='bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600'>
          Click me
        </Button>
        <p className='text-red-500'>
          Edit <code>src/routes/index.tsx</code> and save to reload.
        </p>
        <a
          className='App-link'
          href='https://reactjs.org'
          target='_blank'
          rel='noopener noreferrer'
        >
          Learn React
        </a>
        <a
          className='App-link'
          href='https://tanstack.com'
          target='_blank'
          rel='noopener noreferrer'
        >
          Learn TanStack
        </a>
      </header>
    </div>
  );
}

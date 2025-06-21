import { Button } from '../ui/button';

export default function Header() {
  return (
    <header className='flex items-center justify-between p-4 border-b bg-background'>
      <div className='font-bold text-lg'>coderscreen</div>
      <div className='flex items-center gap-4'>
        <button className='text-xl' title='Settings'>
          ⚙️
        </button>
        <div className='w-8 h-8 rounded-full bg-muted flex items-center justify-center text-lg font-bold'>
          KR
        </div>
        <Button>Create Pad</Button>
      </div>
    </header>
  );
}

import { hc } from 'hono/client';
import { AppRouter } from '@coderscreen/api';

export const client = hc<AppRouter>('http://localhost:8000');

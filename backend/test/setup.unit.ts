import './setup';
import { vi } from 'vitest';

// Los tests unitarios mockean la base: la verificación de sesión (una consulta por request
// autenticado) se da por buena acá. La cubren los tests de integración contra Postgres.
vi.mock('../src/services/sessions', () => ({ isSessionCurrent: async () => true }));

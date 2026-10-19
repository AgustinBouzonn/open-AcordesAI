import app from './app';
import pool from './db';
import { PORT } from './env';

const server = app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});

// En el contenedor node corre como PID 1: sin handler, SIGTERM se ignora y Docker espera 10 s
// para matarlo con SIGKILL en cada deploy. Se deja de aceptar conexiones, se terminan los
// requests en curso y se cierra el pool de Postgres.
let shuttingDown = false;
const shutdown = (signal: string) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[shutdown] ${signal}: cerrando`);
  const force = setTimeout(() => {
    console.error('[shutdown] timeout, saliendo igual');
    process.exit(1);
  }, 8000);
  force.unref();
  server.close(() => {
    pool.end()
      .catch((e) => console.error('[shutdown] pool', e))
      .finally(() => process.exit(0));
  });
  server.closeIdleConnections?.();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

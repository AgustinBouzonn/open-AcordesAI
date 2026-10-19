// Función serverless de Vercel: vercel.json reescribe todo /api/* hacia acá y lo atiende la misma
// app Express que corre en Docker. El backend se compila a backend/dist en el installCommand.
import backend from '../backend/dist/app.js';

export default backend.default;

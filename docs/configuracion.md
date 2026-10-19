# Configuración

AcordesAI se configura con variables de entorno. El archivo [`.env.example`](../.env.example) sirve de plantilla.

## Dónde va cada archivo

| Escenario | Archivo |
|---|---|
| Backend en desarrollo (`npm --prefix backend run dev`) | `backend/.env`, porque el backend lee el `.env` del directorio desde el que corre. |
| Frontend (`npm run dev`, `npm run build`) | `.env` en la raíz. Solo se leen las variables con prefijo `VITE_`. |
| `docker compose` | `.env` en la raíz. Compose pasa al backend únicamente las variables listadas en `docker-compose.yml`. |

En `.env.example`, `DATABASE_URL` apunta al host `postgres` de Docker Compose. Para desarrollo local, cambialo por `localhost`.

## Backend

### Obligatorias

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL. |
| `JWT_SECRET` | Secreto para firmar los tokens. Debe tener al menos 32 caracteres y no puede empezar con `changeme`. |
| `DB_PASSWORD` | Solo para `docker compose`: contraseña del usuario `acordesai` de PostgreSQL. |

### Inteligencia artificial

| Variable | Por defecto | Descripción |
|---|---|---|
| `GEMINI_API_KEY` | | Clave de Google Gemini. Si está definida, el proveedor por defecto es Gemini. |
| `OPENAI_API_KEY` | | Clave de OpenAI o de una API compatible. |
| `AI_PROVIDER` | `gemini`, o `openai` si solo hay clave de OpenAI | Fuerza el proveedor. |
| `AI_API_KEY` | | Clave explícita; tiene prioridad sobre las dos anteriores. |
| `AI_MODEL` | `gemini-2.0-flash` o `gpt-4o-mini` | Modelo a usar. |
| `AI_BASE_URL` | `https://api.openai.com/v1` | Base de una API compatible con OpenAI. |

Sin ninguna clave, la app funciona igual, pero solo con cifrados importados o creados a mano.

`docker-compose.yml` pasa al contenedor todas estas variables desde el `.env` del servidor. Si alguna queda vacía, el backend usa su valor por defecto.

### Opcionales

| Variable | Por defecto | Descripción |
|---|---|---|
| `PORT` | `3001` | Puerto de la API. |
| `FRONTEND_URL` | | URL pública de la app, para los callbacks de OAuth. Sin ella se usa el host del request. |
| `CORS_ORIGIN` | | Orígenes permitidos, separados por comas. Solo hace falta si el frontend se sirve desde otro origen. |
| `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` | | Habilitan el login con Google. Hacen falta las dos. |
| `GITHUB_CLIENT_ID` y `GITHUB_CLIENT_SECRET` | | Habilitan el login con GitHub. Hacen falta las dos. |
| `SIGNALS_ENABLED` | | Solo para tests: con `1`, registra señales de producto también cuando `NODE_ENV=test`. Fuera de los tests se registran siempre. |

Al arrancar, el backend informa en el log qué integraciones quedaron habilitadas.

## Frontend

| Variable | Por defecto | Descripción |
|---|---|---|
| `VITE_API_URL` | `/api` | Base de la API. `/api` funciona cuando frontend y backend comparten host, como detrás de Nginx o con el proxy de Vite. Si la app nativa empaqueta el frontend en lugar de cargar el sitio remoto, usá una URL absoluta, por ejemplo `https://tu-dominio.com/api`. |
| `VITE_PUBLIC_APP_URL` | vacía | URL pública con la que se arman los enlaces para compartir canciones y setlists, por ejemplo `https://tu-dominio.com`. Si está vacía, o no empieza con `http(s)://`, se usa el origen de la página. Conviene definirla en el build de Android. |
| `VITE_NATIVE_API_URL` | vacía | Base absoluta de la API que usa solo la app nativa (Capacitor), por ejemplo `https://tu-dominio.com/api`. Se ignora en la web y si no empieza con `http(s)://`. Si está vacía, la app nativa usa `VITE_API_URL`. |

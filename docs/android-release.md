# Release de Android

La app Android es el mismo frontend empaquetado con Capacitor. El workflow `android-release.yml` genera el APK y el AAB firmados en cada release; esta guía sirve para compilar a mano.

## Requisitos

- Node.js 22
- JDK 21
- Android Studio, o el SDK de Android con Gradle

## Cómo carga la app nativa

`capacitor.config.ts` define `server.url`, así que la app Android abre el sitio publicado en lugar del frontend empaquetado. Por eso, hoy `/api` y el origen de la página ya apuntan al dominio de producción.

Si en algún momento quitás `server.url` para empaquetar el frontend, el origen pasa a ser local y hay que definir en el `.env` de la raíz, antes de compilar:

```bash
VITE_NATIVE_API_URL=https://tu-dominio.com/api
VITE_PUBLIC_APP_URL=https://tu-dominio.com
```

- `VITE_NATIVE_API_URL` solo se usa dentro de la app nativa, así que no cambia el build web. Si está vacía, la app nativa usa `VITE_API_URL`.
- `VITE_PUBLIC_APP_URL` asegura que los enlaces para compartir apunten al dominio público. Conviene definirla siempre en el build de Android.
- El backend tiene que aceptar el origen local de la app en CORS: agregá `https://localhost` a `CORS_ORIGIN`.

## Login social en la app nativa

El login con Google y GitHub navega dentro de la misma WebView: la app abre `/api/auth/oauth/<proveedor>/start`, el proveedor redirige al callback del backend y el backend vuelve a `FRONTEND_URL/#/auth/callback` con el token.

- **Con `server.url` (configuración actual):** todo el flujo ocurre sobre el dominio de producción, así que el token llega a la app. GitHub funciona así. **Google bloquea el login dentro de WebViews de Android** y responde con el error `403 disallowed_useragent`, por política del proveedor.
- **Sin `server.url` (frontend empaquetado):** el inicio del login ya usa la base de la API configurada, pero el backend vuelve a `FRONTEND_URL`, que es el sitio web. La WebView sale de la app empaquetada y el token queda en el sitio web, no en la app.

Para que el login social funcione en la app nativa en los dos casos hace falta un cambio que no se resuelve solo con código del frontend:

1. Abrir el login en el navegador del sistema, por ejemplo con el plugin `@capacitor/browser`, en lugar de la WebView.
2. Registrar un deep link para volver a la app, ya sea un esquema propio o un App Link verificado del dominio, con su `intent-filter` en `AndroidManifest.xml`.
3. Hacer que el backend redirija a ese deep link cuando el login empezó desde la app, y escuchar `appUrlOpen` del plugin `@capacitor/app` para completar la sesión.
4. Si usás un esquema propio, agregar la URL de retorno donde corresponda en las consolas de Google y GitHub.

Hasta entonces, en la app nativa conviene usar el login con email y contraseña.

## Compilar y sincronizar

```bash
npm ci
npm run build
npx cap sync android
```

Para abrir el proyecto en Android Studio:

```bash
npx cap open android
```

## Firma

Agregá estas propiedades a `~/.gradle/gradle.properties` o exportalas como variables de entorno:

```properties
ACORDESAI_UPLOAD_STORE_FILE=/ruta/a/tu-keystore.jks
ACORDESAI_UPLOAD_STORE_PASSWORD=tu_store_password
ACORDESAI_UPLOAD_KEY_ALIAS=tu_alias
ACORDESAI_UPLOAD_KEY_PASSWORD=tu_key_password
```

`ACORDESAI_VERSION_CODE` y `ACORDESAI_VERSION_NAME` permiten fijar la versión; en CI se calculan a partir del número de ejecución y del tag.

## Generar el release

Desde `android/`:

```bash
./gradlew bundleRelease
./gradlew assembleRelease
```

Artefactos:

- `android/app/build/outputs/bundle/release/app-release.aab`
- `android/app/build/outputs/apk/release/app-release.apk`

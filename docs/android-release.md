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

Google bloquea OAuth dentro de WebViews de Android (`403 disallowed_useragent`), así que en la app nativa el login social no usa la WebView:

1. La app abre `/api/auth/oauth/<proveedor>/start?platform=native` en el navegador del sistema (Custom Tabs) con `@capacitor/browser`.
2. `/start` guarda en una cookie que el flujo es nativo. El proveedor vuelve al callback del backend en ese mismo navegador.
3. El backend no manda el JWT a la app. Genera un código aleatorio de un solo uso que vence en 2 minutos, guarda solo su hash en `oauth_native_codes` y redirige a `com.acordesai.app://auth/callback?code=...`. Si algo falla, redirige ahí mismo con `?error=...`.
4. Android abre la app por el `intent-filter` de `AndroidManifest.xml`. `AuthContext` escucha `appUrlOpen` con `@capacitor/app`, cierra el navegador y canjea el código con `POST /api/auth/oauth/native/exchange`. El backend lo marca como usado en la misma sentencia que lo valida, así que no se puede canjear dos veces.

El destino del deep link es fijo: sale de `NATIVE_APP_SCHEME` del backend, nunca de un parámetro del cliente, así que el callback no es un open redirect. El JWT nunca viaja en la URL del deep link: otra app podría registrar el mismo esquema y leerla, pero el código solo sirve una vez y por poco tiempo.

En la web el flujo no cambia: el backend vuelve a `FRONTEND_URL/#/auth/callback` con el token.

### Pasos manuales para habilitarlo

1. **Consolas de Google y GitHub:** no hace falta registrar el deep link. La URL de retorno que ven los proveedores sigue siendo la del backend, `https://<tu-dominio>/api/auth/oauth/google/callback` y `https://<tu-dominio>/api/auth/oauth/github/callback`. Verificá que esas dos estén registradas y que `FRONTEND_URL` apunte a ese dominio.
2. **Variables:** `NATIVE_APP_SCHEME` es opcional. Si cambiás el `appId` de `capacitor.config.ts`, cambiá también esa variable, el esquema del `intent-filter` y `NATIVE_AUTH_CALLBACK` en `services/nativeAuth.ts`.
3. **Base de datos:** la migración `009_oauth_native_codes.sql` crea la tabla de códigos. El deploy la aplica solo.
4. **App Android:** hay que volver a compilarla y publicarla, porque suma dos plugins nativos y el `intent-filter`: `npm run build`, `npx cap sync android` y el build de release de la sección siguiente.

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

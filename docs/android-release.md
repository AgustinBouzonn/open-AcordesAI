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
VITE_API_URL=https://tu-dominio.com/api
VITE_PUBLIC_APP_URL=https://tu-dominio.com
```

`VITE_PUBLIC_APP_URL` asegura que los enlaces para compartir apunten al dominio público. Conviene definirla siempre en el build de Android.

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

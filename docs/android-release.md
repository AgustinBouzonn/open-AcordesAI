# Android Release

## Variables

Agrega estas propiedades a `~/.gradle/gradle.properties` o exportalas en tu shell:

```properties
ACORDESAI_UPLOAD_STORE_FILE=/ruta/a/tu-keystore.jks
ACORDESAI_UPLOAD_STORE_PASSWORD=tu_store_password
ACORDESAI_UPLOAD_KEY_ALIAS=tu_alias
ACORDESAI_UPLOAD_KEY_PASSWORD=tu_key_password
```

## Backend para la app nativa

Configura en `.env`:

```bash
VITE_NATIVE_API_URL=https://tu-dominio.com/api
VITE_PUBLIC_APP_URL=https://tu-dominio.com
```

## Sincronizar Android

```bash
npm run android:sync
```

## Abrir Android Studio

```bash
npm run android:open
```

## Generar release

Desde `android/`:

```bash
./gradlew bundleRelease
./gradlew assembleRelease
```

Artefactos esperados:

- `android/app/build/outputs/bundle/release/app-release.aab`
- `android/app/build/outputs/apk/release/app-release.apk`

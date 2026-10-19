# Integración con IA

Cómo genera cifrados el backend. El código está en `backend/src/services/aiService.ts` y lo usa la ruta de canciones (`backend/src/routes/songs.ts`) cuando una canción no tiene cifrado en caché para el instrumento pedido.

## Sin SDK

El backend no usa ningún SDK de IA. Hace llamadas HTTP con `fetch` a una de dos APIs:

| Proveedor | Endpoint | Autenticación |
|---|---|---|
| Gemini | `https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent` | Header `x-goog-api-key` |
| OpenAI o compatible | `{AI_BASE_URL}/chat/completions` | Header `Authorization: Bearer` |

La clave va siempre en un header, nunca en la URL, para que no quede en logs de proxies ni en mensajes de error. Los errores se registran con la clave redactada.

## Configuración

Todo se resuelve al arrancar el backend, a partir de variables de entorno:

| Variable | Valor por defecto |
|---|---|
| `AI_PROVIDER` | `gemini` si hay `GEMINI_API_KEY`, `openai` si solo hay `OPENAI_API_KEY`, y `gemini` si no hay ninguna |
| `AI_API_KEY` | La clave del proveedor elegido, o la que esté definida |
| `AI_MODEL` | `gemini-2.0-flash` con Gemini, `gpt-4o-mini` con OpenAI |
| `AI_BASE_URL` | `https://api.openai.com/v1`, solo para el proveedor OpenAI |

Sin ninguna clave, generar un cifrado devuelve un error explicando que falta configurar la IA. La referencia completa de variables está en [configuracion.md](configuracion.md).

## Prompt

`buildPrompt` arma un único prompt por canción e instrumento:

- **Datos del usuario acotados:** título y artista pasan por `sanitizePromptField`, que quita saltos de línea, comillas y caracteres de control, y corta a 150 caracteres. El resultado se cachea para todos los usuarios, así que esto evita inyección de instrucciones.
- **Delimitadores:** la canción va entre etiquetas `<song>`, con la indicación de tratarla solo como título y artista.
- **Instrumento:** se agrega una instrucción específica para guitarra, ukelele o piano. Cualquier otro valor usa la de guitarra.
- **Formato de salida:** se pide JSON con `title`, `artist`, `key` y `content`, con los acordes sobre la letra.

## Respuesta

- **Modo JSON:** con Gemini se pide `responseMimeType: application/json`. Con OpenAI se pide `response_format: json_object` y un mensaje de sistema que exige solo JSON.
- **Parámetros:** temperatura de 0.3 y timeout de 20 segundos en ambos casos.
- **Extracción tolerante:** `extractJson` acepta JSON puro, JSON dentro de un bloque de código o el primer objeto que encuentre en el texto.
- **Valores de respaldo:** si falta algún campo, se usan el título y artista pedidos, la tonalidad `C` y un mensaje de error en el contenido. Si la respuesta no es JSON válido, se devuelve un error para reintentar.

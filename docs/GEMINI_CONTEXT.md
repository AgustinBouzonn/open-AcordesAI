# Contexto de Desarrollo y Guías de Gemini API

Este proyecto sigue las guías estrictas del SDK `@google/genai` para garantizar compatibilidad y rendimiento. A continuación se detalla el contexto técnico utilizado por el asistente de IA.

## SDK y Nomenclatura

- **Librería**: `@google/genai`
- **Clase Principal**: `GoogleGenAI`
- **Importación**: `import { GoogleGenAI } from "@google/genai";`

## Inicialización

```typescript
// Correcta inicialización
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
```

## Modelos Utilizados

El proyecto selecciona el modelo adecuado según la tarea:

1.  **Tareas de Texto Básicas**: `gemini-3-flash-preview`
    - Usado para: Búsqueda de canciones, generación rápida de listas.
2.  **Tareas Complejas (Razonamiento)**: `gemini-3-pro-preview`
    - Usado para: Análisis profundo (si fuera necesario).
3.  **Generación de Cifrados**: Actualmente usamos `gemini-3-flash-preview` por su velocidad y eficiencia para estructurar texto y acordes.

## Generación de Contenido (Texto y JSON)

Para obtener los cifrados y resultados de búsqueda estructurados, utilizamos `responseSchema`.

### Ejemplo de Configuración para JSON (Búsqueda)

```typescript
const response = await ai.models.generateContent({
  model: "gemini-3-flash-preview",
  contents: "Query...",
  config: {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
            // Propiedades definidas
        }
      }
    },
  },
});
```

### Extracción de Texto

Se accede directamente a la propiedad `.text` de la respuesta:
```typescript
const text = response.text; // String con el contenido
```

## Reglas de Implementación en AcordesAI

1.  **No gestionar API Keys en UI**: La key viene de `process.env.API_KEY`.
2.  **Statelessness**: Las llamadas a la API son independientes.
3.  **Instrumentos**:
    - Para **Guitarra**, **Ukelele** y **Piano**, se inyectan instrucciones específicas en el `systemInstruction` o en el prompt del usuario para adaptar la respuesta del modelo (ej. "Provide chords for Ukulele standard tuning").

## Funcionalidades de IA Implementadas

1.  **Search Grounding**: (Simulado vía prompt actualmente) El sistema pide "canciones populares" que coincidan con la query.
2.  **Extraction**: El sistema extrae Título, Artista, Tono y Cuerpo del cifrado de la respuesta no estructurada o semi-estructurada de la IA.

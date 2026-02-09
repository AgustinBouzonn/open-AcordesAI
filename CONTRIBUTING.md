# Contributing to AcordesAI 🎸

¡Gracias por tu interés en contribuir a AcordesAI! Este documento te guiará sobre cómo contribuir al proyecto.

## 🤝 ¿Cómo Puedes Contribuir?

### 🐹 Reportar Bugs
Si encuentras un bug, por favor:
1. Busca si ya existe un issue relacionado
2. Si no existe, crea un nuevo issue con:
   - Título descriptivo
   - Pasos para reproducir el bug
   - Comportamiento esperado vs actual
   - Screenshots si es posible
   - Tu entorno (OS, navegador, versión)

### 💡 Sugerir Features
¿Tienes una idea para mejorar AcordesAI?
1. Busca si ya existe una suggestion
2. Si no, crea un nuevo issue con:
   - Título claro
   - Descripción detallada de la feature
   - Casos de uso
   - Posible implementación (si la conoces)

### 🔧 Contribuir Código
Antes de empezar a codear:
1. Busca issues etiquetados como `good first issue` o `help wanted`
2. Comenta en el issue que quieres trabajar en él
3. Sigue los pasos abajo para enviar tu PR

---

## 🚀 Pasos para Contribuir

### 1. Fork y Clona
```bash
# Fork el repositorio en GitHub
# Clona tu fork
git clone https://github.com/TU_USUARIO/open-AcordesAI.git
cd open-AcordesAI
```

### 2. Crea una Rama
```bash
# Crea una rama para tu feature/fix
git checkout -b feature/tu-feature-descriptiva
# o
git checkout -b fix/tu-bug-fix-descriptivo
```

### 3. Instala Dependencias
```bash
npm install
```

### 4. Configura Variables de Entorno
```bash
cp .env.example .env
# Edita .env y añade tu VITE_GEMINI_API_KEY
```

### 5. Haz tus Cambios
- Sigue el código style existente
- Añade comentarios si es necesario
- Actualiza la documentación si cambia algo
- Asegúrate de que no haya errores de TypeScript (`npm run type-check`)
- Formatea el código (`npm run format`)

### 6. Testea tus Cambios
```bash
# Correr el servidor de desarrollo
npm run dev

# Correr tests (si existen)
npm run test
```

### 7. Commit tus Cambios
Usa [Conventional Commits](https://www.conventionalcommits.org/):
```bash
git add .
git commit -m "feat: add chord transpose feature"
# o
git commit -m "fix: resolve crash when searching empty query"
# o
git commit -m "docs: update README with new instructions"
```

### 8. Push y Crea Pull Request
```bash
git push origin feature/tu-feature-descriptiva
```
Luego ve a GitHub y crea un Pull Request.

---

## 📋 Convenciones de Commit

Usamos el formato de **Conventional Commits**:
- `feat:` Nuevas features
- `fix:` Bug fixes
- `docs:` Cambios en documentación
- `style:` Formateo de código, sin cambios lógicos
- `refactor:` Refactorización de código
- `test:` Añadir o actualizar tests
- `chore:` Cambios en build process, tools, etc.

**Ejemplos:**
```bash
feat: add ukulele chord diagrams
fix: prevent duplicate song cache entries
docs: update installation instructions
refactor: improve gemini service error handling
```

---

## 🎨 Estilo de Código

### TypeScript
- Usa tipos estrictos
- Evita `any`
- Usa interfaces para objetos
- Añade JSDoc para funciones complejas

### React
- Usa Functional Components con Hooks
- Usa `useState`, `useEffect` cuando sea necesario
- Mantén los componentes pequeños y enfocados
- Usa Props Types

### Nombres
- **Variables/Funciones:** camelCase
- **Componentes:** PascalCase
- **Constantes:** UPPER_SNAKE_CASE
- **Archivos:** kebab-case

**Ejemplos:**
```typescript
// ✅ Bueno
const songData = { ... };
function fetchSongById(id: string) { ... }
const SongViewer = () => { ... };
const MAX_CACHE_SIZE = 10;

// ❌ Malo
const SongData = { ... };
function FetchSongById(id: string) { ... }
const songviewer = () => { ... };
const max_cache_size = 10;
```

---

## 🏗️ Estructura del Proyecto

```
src/
├── components/       # Componentes React reutilizables
├── services/         # Lógica de negocio y APIs
├── types/           # Definiciones TypeScript
├── utils/           # Funciones utilitarias
├── App.tsx          # App principal
└── main.tsx         # Entry point
```

Cuando añadas código:
- **Componentes:** `src/components/`
- **Services:** `src/services/`
- **Types:** `src/types/`
- **Utils:** `src/utils/`

---

## 📝 Qué Contribuir

### ✅ Bienvenido
- Bug fixes
- Nuevas features (discutir primero en un issue)
- Mejoras de documentación
- Tests
- Optimizaciones de rendimiento
- Mejoras de UI/UX

### ❌ No Bienvenido
- Cambios drásticos sin discusión previa
- Código sin formatear
- Commits sin mensaje claro
- Features fuera del scope del proyecto

---

## 🧪 Testing

Si añades nueva funcionalidad:
1. Añade tests si existen
2. Testea manualmente en diferentes navegadores
3. Verifica que no rompa funcionalidad existente

### Navegadores Soportados
- Chrome/Edge (última versión)
- Firefox (última versión)
- Safari (última versión)

---

## 📧 Contacto

¿Tienes preguntas?
- Abre un issue con la etiqueta `question`
- Contacta al maintainer: [@AgustinBouzonn](https://github.com/AgustinBouzonn)

---

## 📜 Licencia

Al contribuir, aceptas que tus contribuciones serán licenciadas bajo la **Licencia MIT** del proyecto.

---

## ⭐ Reconocimientos

Gracias a todos los contribuidores que hacen posible AcordesAI. ¡Su esfuerzo es muy apreciado!

---

<div align="center">
  <sub>Hecho con ❤️ por la comunidad de AcordesAI</sub>
</div>

# 🎸 AcordesAI - Cifrados Inteligentes con IA

<div align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/PWA-Enabled-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License"/>
</div>

<div align="center">
  <h3>🎵 Tu asistente musical con Inteligencia Artificial</h3>
  <p>
    Genera cifrados, acordes y letras de cualquier canción en tiempo real con el poder de Google Gemini
  </p>
</div>

---

## 🤖 Disclaimer de Responsabilidad

<div align="center">

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ⚠️ ESTE README FUE 85% ESCRITO POR IA ⚠️                 ║
║                                                              ║
║   Mi aporte:                                                ║
║   ✓ Tuve la idea del proyecto                              ║
║   ✓ Le dije a la IA qué escribir                           ║
║   ✓ Revisé que no dijera cosas raras                       ║
║   ✓ Añadí el chiste del 85%                                ║
║   ✓ Probablemente escribí algo de código                   ║
║   (pero también puede que la IA lo hiciera)                 ║
║                                                              ║
║   La IA hizo:                                              ║
║   ✓ Todo el formateo bonito                                ║
║   ✓ Los badges (soy muy malo acordándome los nombres)     ║
║   ✓ La tabla de features                                   ║
║   ✓ Este disclaimer                                        ║
║                                                              ║
║   ¿Resultado?                                              ║
║   Un README que se ve profesional mientras                 ║
║   yo practico guitarra (que es lo que realmente            ║
║   me importa).                                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

</div>

---

## 📖 Descripción

**AcordesAI** es una Progressive Web App (PWA) revolucionaria diseñada para músicos de todos los niveles. A diferencia de las bases de datos tradicionales que solo contienen canciones preexistentes, AcordesAI utiliza la **inteligencia artificial de Google Gemini** para generar cifrados, acordes y letras de **cualquier canción**, incluso si nunca antes fue transcrita.

## 🏗️ Arquitectura

La app hoy funciona como una arquitectura full-stack:

- `frontend`: React + Vite en la raíz del repo
- `backend`: Express + TypeScript en `backend/`
- `db`: PostgreSQL con migraciones en `backend/migrations`
- `proxy`: Nginx para servir frontend y enrutar `/api`

La generación de cifrados y las integraciones de IA viven en el backend. El frontend consume la API mediante `services/apiClient.ts`.

### 🌟 ¿Por qué AcordesAI?

- 🎯 **Sin límites:** No estás restringido a una base de datos preexistente
- ⚡ **Instantáneo:** Obtén cifrados en segundos, no en horas
- 🎸 **Multi-instrumento:** Guitarra, Ukelele y Piano
- 💾 **Offline:** Funciona sin conexión gracias a PWA
- 🆓 **Gratis:** Código abierto para la comunidad

---

## 📸 Screenshots

<div align="center">

### Pantalla Principal
![Home](docs/screenshots/01-home.png)

### Búsqueda de Canciones
![Search](docs/screenshots/02-search.png)

### Visualizador con Acordes IA
![Song View](docs/screenshots/03-song-view.png)

</div>

---

## ✨ Características Principales

### 🎯 Búsqueda Inteligente
```
🔍 Busca cualquier canción → 🧠 IA detecta metadatos → 🎸 Obtén cifrado al instante
```

- **Búsqueda universal:** Encuentra cualquier canción o artista
- **Detección automática:** Identifica título, artista y tonalidad
- **Sin restricciones:** No dependes de bases de datos externas

### 🎸 Visualizador Avanzado

| Feature | Descripción |
|---------|-------------|
| 🎼 **Cifrados IA** | Acordes generados por Gemini |
| 🎹 **Multi-instrumento** | Guitarra, Ukelele, Piano |
| 📜 **Autoscroll** | Velocidad ajustable 1-10 |
| 🔤 **Fuente ajustable** | Tamaño personalizable |
| 🎚️ **Transposición** | Cambio de tono (próximamente) |

### 📚 Gestión de Biblioteca

```yaml
Biblioteca Inteligente:
  Favoritos:
    - Acceso rápido a tus canciones preferidas
    - Sincronización cross-device

  Historial:
    - Últimas 10 canciones visualizadas
    - Acceso rápido a canciones recientes

  Caché Local:
    - Ahorro de datos
    - Acceso instantáneo
    - Funciona offline
```

---

## 🛠️ Stack Tecnológico

### Frontend
<div>
  <img src="https://img.shields.io/badge/React-19-black?style=flat-square&logo=react&logoColor=61DAFB" alt="React 19"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 5.0"/>
  <img src="https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind 3.4"/>
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 5.0"/>
</div>

### IA & Backend
<div>
  <img src="https://img.shields.io/badge/Gemini_Pro-4285F4?style=flat-square&logo=google&logoColor=white" alt="Gemini Pro"/>
  <img src="https://img.shields.io/badge/React_Router-6.20-CA4245?style=flat-square&logo=react-router&logoColor=white" alt="React Router"/>
  <img src="https://img.shields.io/badge/Zustand-4.4-000000?style=flat-square&logo=zustand&logoColor=white" alt="Zustand"/>
</div>

---

## 📦 Instalación Rápida

```bash
# 1. Clonar el repositorio
git clone https://github.com/AgustinBouzonn/open-AcordesAI.git
cd open-AcordesAI

# 2. Instalar dependencias del frontend y backend
npm install
npm --prefix backend install

# 3. Configurar entorno
copy .env.example .env

# 4. Levantar frontend
npm run dev

# 5. Levantar backend en otra terminal
npm --prefix backend run dev
```

Para correr la app completa también necesitás PostgreSQL y variables reales para `DATABASE_URL` y `JWT_SECRET`.

## 🧪 Scripts Útiles

```bash
# Frontend
npm run dev
npm run build
npm run typecheck

# Full build
npm run build:all

# Backend
npm --prefix backend run dev
npm --prefix backend run build
npm --prefix backend test
```

## 🔍 Verificación Rápida

```bash
npm run typecheck
npm run build:all
npm --prefix backend test
```

Notas:
- El backend requiere `DATABASE_URL` y `JWT_SECRET` reales.
- `JWT_SECRET` debe tener al menos 32 caracteres.
- Si frontend y backend corren en orígenes distintos, definir `CORS_ORIGIN`.
- La generación de acordes usa variables backend como `AI_API_KEY`, `AI_PROVIDER`, `AI_MODEL` y `AI_BASE_URL`.

---

## 🚀 Uso

### 1️⃣ Configurar API Key
```bash
# Editar .env
VITE_GEMINI_API_KEY=tu_api_key_aqui
```

### 2️⃣ Buscar Canción
```
1. Escribe nombre de canción o artista
2. La IA detecta metadatos automáticamente
3. Espera la generación (segundos)
```

### 3️⃣ Visualizar y Practicar
```
1. Selecciona instrumento (Guitarra/Ukelele/Piano)
2. Ajusta tamaño de fuente y autoscroll
3. ¡Practica como un profesional!
```

---

## 📁 Estructura del Proyecto

```
open-AcordesAI/
├── App.tsx
├── components/
├── services/
├── types.ts
├── backend/
│   ├── src/
│   ├── migrations/
│   ├── test/
│   └── package.json
├── public/
├── docker-compose.yml
├── nginx.conf
├── .env.example
└── package.json
```

---

## 🔧 Configuración

### Variables de Entorno
```bash
# Frontend
VITE_API_URL=http://localhost:3001/api

# Backend obligatorias
DATABASE_URL=postgres://acordesai:password@localhost:5432/acordesai
JWT_SECRET=una-clave-larga-de-al-menos-32-caracteres

# Backend opcionales
PORT=3001
CORS_ORIGIN=http://localhost:5173
AI_API_KEY=
AI_PROVIDER=gemini
AI_MODEL=gemini-2.0-flash
AI_BASE_URL=https://api.openai.com/v1
```

Referencia rápida:
- `DATABASE_URL` y `JWT_SECRET` son obligatorias.
- `AI_API_KEY` es necesaria para generar cifrados con IA.
- `VITE_API_URL` solo hace falta si el frontend no usa el proxy por defecto.

---

## 🌟 Roadmap

### ✅ Versión 1.0 (Actual)
- [x] Búsqueda de canciones con IA
- [x] Multi-instrumento (Guitarra, Ukelele, Piano)
- [x] Caché local e historial
- [x] Autoscroll y fuente ajustable
- [x] PWA functionality

### 🔜 Versión 2.0 (Próximamente)
- [ ] 🎚️ **Transposición** de tono
- [ ] 🎵 **Reproductor** de audio integrado
- [ ] 📄 **Exportar** a PDF
- [ ] 🎤 **Modo karaoke** sincronizado
- [ ] 🌐 **Multi-idioma** (EN, PT, FR)
- [ ] 📊 **Estadísticas** de práctica

### 💡 Versión 3.0 (Futuro)
- [ ] 🎸 **Diagramas** de acordes interactivos
- [ ] 🤖 **Recomendaciones** de canciones
- [ ] 🎓 **Tutoriales** integrados
- [ ] 👥 **Comunidad** y sharing
- [ ] 📱 **App nativa** (iOS, Android)

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! 🎉

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: Add some amazing feature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

**Ver [CONTRIBUTING.md](CONTRIBUTING.md) para más detalles.**

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver archivo [LICENSE](LICENSE) para detalles.

---

## 👨‍💻 Autor

**Agustín Bouzon**

- 💼 [LinkedIn](https://linkedin.com/in/agustinbouzon)
- 🌐 [Website](https://bthings.space)
- 📧 [Email](mailto:abouzon@linksolution.com.ar)

---

## 🙏 Agradecimientos

- **Google Gemini** - Por la API de IA que hace posible este proyecto
- **Vite** - Por la herramienta de build increíblemente rápida
- **React** - Por el framework frontend que facilita el desarrollo
- **Tailwind CSS** - Por el sistema de diseño utility-first
- **La comunidad** - Por el feedback y soporte constante
- **ChatGPT/Claude/Gemini** - Por ayudarme a escribir este README (y probablemente algo de código)

---

## 🎭 Nota Final

<div align="center">

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Si estás leyendo esto y pensás:                          │
│   "¡Qué README más profesional!"                           │
│                                                             │
│   Gracias, me lo escribió mi asistente IA.                 │
│   Yo solo le dije qué poner.                               │
│                                                             │
│   Si pensás:                                               │
│   "¡Qué README más largo e innecesario!"                   │
│                                                             │
│   También me lo escribió la IA.                            │
│   Le gusta mucho explicar cosas.                           │
│                                                             │
│   En fin... ¿usás la app o seguis leyendo READMEs?        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

</div>

---

<div align="center">

## ⭐ ¿Te gusta este proyecto? ¡Dejame una star! ⭐

[![GitHub stars](https://img.shields.io/github/stars/AgustinBouzonn/open-AcordesAI?style=for-the-badge&logo=github&logoColor=white&labelColor=1a1a2e)](https://github.com/AgustinBouzonn/open-AcordesAI)

[![GitHub forks](https://img.shields.io/github/forks/AgustinBouzonn/open-AcordesAI?style=for-the-badge&logo=github&logoColor=white&labelColor=1a1a2e)](https://github.com/AgustinBouzonn/open-AcordesAI/fork)

---

<sub>Hecho con ❤️, 🎸 y mucho ☕ (con ayuda de IA) por <a href="https://github.com/AgustinBouzonn">Agustín Bouzon</a></sub>

<i>"La música es el lenguaje universal, la IA es el traductor"</i>

<i>"Y yo soy el tipo que le dice a la IA qué traducir"</i>

</div>

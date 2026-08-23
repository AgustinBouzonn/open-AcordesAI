
## 2024-05-24 - Accesibilidad en botones de acción del SongViewer
**Learning:** Los botones con íconos (Share, Favorite, Comments) en la interfaz principal carecían de alternativas textuales, afectando negativamente la experiencia para usuarios de lectores de pantalla y usuarios de mouse sin tooltips visibles. Además, anidar etiquetas contables (badges) sin `aria-hidden` causaba lectura errónea o redundante.
**Action:** Asegurar que todos los botones de íconos únicos tengan atributos `aria-label` descriptivos en español y un `title` para tooltips. Si un botón contiene un badge, el `aria-label` debe incluir el conteo de manera dinámica, y el badge debe ocultarse con `aria-hidden="true"`.

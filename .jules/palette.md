## 2026-05-23 - Agregando aria-labels a botones de solo icono
**Learning:** En la aplicación se estaban utilizando muchos botones de solo icono (como edición, borrado, ordenamiento, cancelar y confirmar) con atributos `title` pero sin `aria-label`, lo que dificulta la navegación para usuarios de lectores de pantalla.
**Action:** Asegurarse de siempre incluir `aria-label` descriptivos en español (el idioma de la UI) cuando se usan componentes de iconos sin texto visual en los botones interactivos (e.g., `aria-label="Renombrar"` para el icono `Pencil`).

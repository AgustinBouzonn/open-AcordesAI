## 2025-02-21 - Explaining Disabled States
**Learning:** In this application, many core interactions (rating, favoriting, importing) are visually disabled for unauthenticated users, leading to dead clicks and confusion since there is no feedback on why they don't work.
**Action:** When disabling interactive elements due to auth state, always provide a dynamic `title` tooltip (e.g., 'Inicia sesión para valorar') to explain the requirement, converting a frustrating dead end into clear guidance.

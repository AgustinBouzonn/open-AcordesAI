## 2025-05-23 - Interactive Card Lists
**Learning:** This app frequently uses "card" style lists (Trending, Favorites) that act as navigation or action triggers. Implementing these as `div`s with `onClick` completely breaks keyboard accessibility.
**Action:** Always wrap interactive card content in a `<button type="button" className="w-full text-left ...">` to gain native keyboard support (Tab, Enter, Space) and screen reader support without complex ARIA roles.

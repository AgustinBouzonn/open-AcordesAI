## 2026-02-21 - Card Accessibility
**Learning:** Navigation cards implemented as `div` with `onClick` exclude keyboard users and screen readers from core functionality.
**Action:** Replace interactive `div` wrappers with semantic `<button>` elements, using `w-full text-left` to maintain card layout while gaining native focus management and keyboard support.

## 2026-04-08 - Extract React Router view components
**Learning:** React Router view components defined inside the main App component force React Router to execute their logic on unrelated state changes.
**Action:** Extract them as React.memo components completely outside the main AppContent component, passing callbacks via useCallback and the navigate function as a prop.

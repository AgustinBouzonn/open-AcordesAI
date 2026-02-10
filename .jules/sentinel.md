## 2024-05-22 - Unsafe Local Storage Deserialization
**Vulnerability:** The application uses `localStorage` as a primary data store but retrieves data using `JSON.parse` without `try-catch` blocks or validation.
**Learning:** In offline-first PWAs that rely heavily on client-side storage, treating `localStorage` as a trusted source can lead to application crashes (DoS) if the data is corrupted or tampered with.
**Prevention:** Always wrap `JSON.parse` of external/storage data in a `try-catch` block or use a safe parsing helper. Validate the schema of the parsed data before using it.

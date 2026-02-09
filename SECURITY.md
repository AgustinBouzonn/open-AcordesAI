# Security Policy

## Supported Versions

Currently, only the latest version of AcordesAI is supported with security updates.

| Version | Supported          |
|---------|--------------------|
| Latest  | ✅ Supported       |
| Older   | ❌ Unsupported     |

---

## Reporting a Vulnerability

If you discover a security vulnerability in AcordesAI, please report it responsibly.

### How to Report

1. **Do NOT** create a public issue
2. Send an email to: [abouzon@linksolution.com.ar](mailto:abouzon@linksolution.com.ar)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if known)

### Response Timeline

- **Initial response**: Within 48 hours
- **Investigation**: Within 7 days
- **Fix & release**: Within 30 days (depending on severity)

### What Happens Next

1. We will acknowledge receipt of your report
2. We will investigate the vulnerability
3. We will develop a fix
4. We will release a security update
5. We will credit you (if desired)

---

## Security Best Practices

### For Users

1. **API Key Security**
   - Never commit API keys to public repositories
   - Use environment variables (`.env` files)
   - Rotate keys regularly
   - Use `.env.example` as template

2. **Data Privacy**
   - All song data is processed by Google Gemini API
   - Review Google's [privacy policy](https://policies.google.com/privacy)
   - Songs are cached locally in your browser

3. **PWA Security**
   - Only install from trusted sources
   - Keep the app updated
   - Clear cache regularly if needed

### For Developers

1. **API Keys**
   ```bash
   # ✅ GOOD - Use environment variables
   VITE_GEMINI_API_KEY=your_key_here

   # ❌ BAD - Never hardcode keys
   const apiKey = "AIza..."; // Don't do this!
   ```

2. **Dependencies**
   ```bash
   # Regularly audit dependencies
   npm audit
   npm audit fix

   # Keep dependencies updated
   npm update
   ```

3. **Code Review**
   - All code changes should be reviewed
   - Use branch protection rules
   - Enable security checks in CI/CD

---

## Known Security Considerations

### Google Gemini API

- **Data Sent to Google**: Song titles, artist names, and lyrics are sent to Google's servers for processing
- **Data Retention**: Google may retain this data according to their policies
- **No PII**: The app does not send personally identifiable information

### Local Storage

- **Caching**: Generated songs are cached in browser's localStorage
- **Persistence**: Data persists until cleared by user or app
- **Sharing**: LocalStorage is not shared across domains

### Network Requests

- **HTTPS Only**: All API requests use HTTPS
- **No Third-Party**: Only communicates with Google's API
- **CORS**: Follows standard CORS policies

---

## Dependency Security

### Regular Audits

We run regular security audits on our dependencies:

```bash
npm audit
npm audit fix
```

### Vulnerability Scanning

Our CI/CD pipeline includes:
- **Dependabot**: Automated dependency updates
- **GitHub Actions**: Security scanning
- **Snyk** (optional): Additional vulnerability scanning

---

## Security Headers

If hosting the PWA, consider these security headers:

```
Content-Security-Policy: default-src 'self'; connect-src https://generativelanguage.googleapis.com; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## Contact

For security-related questions or concerns:

- **Email**: [abouzon@linksolution.com.ar](mailto:abouzon@linksolution.com.ar)
- **GitHub Security**: [https://github.com/AgustinBouzonn/open-AcordesAI/security](https://github.com/AgustinBouzonn/open-AcordesAI/security)

---

<div align="center">

**Thank you for helping keep AcordesAI secure!** 🔒

</div>

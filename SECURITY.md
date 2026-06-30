# Security Policy

## Project Status

SportBuddy is a portfolio/student project. It is not an audited production service.

## Supported Versions

Security notes apply to the current `main` branch. Older commits are kept for project history and may not receive updates.

## Reporting a Vulnerability

If you find a vulnerability or a sensitive file accidentally committed to this repository, please contact the repository owner privately before opening a public issue. Include:

- affected feature, route, or file,
- short reproduction steps or explanation,
- potential impact,
- whether any secret, credential, API key, token, certificate, database dump, or uploaded user file appears to be exposed.

Do not include real credentials, private keys, tokens, or exploit payloads in public issues.

## Secret Handling

Real values for `.env`, OAuth, Gemini, Google Maps, Brevo, VAPID, database credentials, production URLs, and uploaded user files must stay outside Git. Keep only `.env.example` with safe placeholder values.

If a real secret is ever committed, rotate it with the relevant provider. Removing it from the current tree is not enough because Git history may still contain the value.

## Limitations

- Runtime uploads are local in development and need durable object storage for production.
- Production deployment would require stronger secret management, monitoring, rate limiting, backup strategy, and provider-specific hardening.
- Some integrations are optional and should fail safely when keys are missing.

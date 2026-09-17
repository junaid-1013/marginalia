# Security policy

Marginalia handles people's documents and, when they choose, their AI provider keys, so we take security reports seriously.

## Reporting a vulnerability

**Please do not open a public issue.** Report it privately through GitHub: open the **Security** tab of this repository and choose **Report a vulnerability**. If that is not available, contact the maintainers through the links on the [About page](https://marginalia-jj.vercel.app/about).

Include what you found, how to reproduce it, and the impact you expect. We will acknowledge your report, keep you updated, and credit you in the fix if you wish.

## What is in scope

- Access to another user's documents, chats or keys
- Leaking, logging or weakening protection of saved AI keys
- Authentication or session problems
- Injection, SSRF or file handling problems in the upload and processing pipeline

## Good to know

- Saved AI keys are encrypted with AES-256-GCM using `KEY_ENCRYPTION_SECRET`. Anyone running their own copy must keep that secret private and back it up. Rotation steps are in the [README](README.md#bring-your-own-key).
- If you run your own deployment, you are responsible for its configuration and secrets.
- If you think an AI key was exposed, revoke it with the provider as well as removing it in the app.

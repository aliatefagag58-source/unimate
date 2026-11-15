UniMate Phase 2 update

This update replaces ONLY config.js. It adds:
- Account settings page
- Update display name
- Change password
- Forgot-password email flow
- Arabic/English interface toggle (main interface labels and dynamic content covered by the translation map)
- Per-account language and theme preferences

Installation:
1. Open the GitHub repository: https://github.com/aliatefagag58-source/unimate
2. Open config.js.
3. Choose Edit (pencil).
4. Replace the entire file with the contents of the config.js in this ZIP.
5. Commit the change to main.
6. Wait for GitHub Pages to deploy, then open:
   https://aliatefagag58-source.github.io/unimate/?v=3

Important:
- No database migration is required.
- Existing subjects, tasks, attendance, files, and accounts are not deleted.
- Password recovery email redirect uses the current app URL. If Supabase rejects it, add
  https://aliatefagag58-source.github.io/unimate/** under Authentication > URL Configuration > Redirect URLs.
- Test name update, password update, reset email, English toggle, and theme toggle after deployment.

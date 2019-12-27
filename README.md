# COMP/CON Content Authoring extension for VSCode
This simple extension right now does two things:
- Adds JSON schemas for C/C content pack .json files (lcp_manifest.json, weapons.json, etc...)
- Adds a build task that generates the .LCP file at workspace root. For the task to work, you need in your PATH: 7zip CLI on windows (`7z`), or `zip` on mac/linux (NOTE: latter two not actually tested)
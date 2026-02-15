Self-hosting Font Awesome
=========================

This folder is the target location for a local copy of Font Awesome.

Quick install (run from project root in PowerShell):

```powershell
.\scripts\fetch-fontawesome.ps1 -version 6.5.0
```

Notes:
- The script downloads the official Font Awesome web ZIP from GitHub releases and extracts it here.
- Ensure you have internet access and permission to run PowerShell scripts.
- After running, uncomment or add this line in `index.html` to use the local copy:

    <link rel="stylesheet" href="/vendor/fontawesome/css/all.min.css" />

If you prefer not to run the script, manually download the "fontawesome-free-*-web.zip" from the Font Awesome releases page, extract its contents into this folder, and reference the CSS as above.

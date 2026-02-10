# RenameIt

A clean, fast bulk file renamer that lets you **upload files, apply consistent names, and download everything as a ZIP**.

- Drag & drop uploads
- Live rename preview
- Multiple numbering styles
- Filename cleanup options (spaces/symbols/lowercase)
- Dark mode

---

## Demo / Screenshots

> - `assets/light.png`
> - `assets/dark.png`

---

## Features

### Bulk rename + ZIP download
Upload multiple files, pick your naming scheme, and download a `renamed_files.zip`.

### Numbering styles
Available numbering styles (via UI dropdown):

- `001, 002, 003…` (padded)
- `001. 002. 003.` (padded variant)
- `(1), (2), (3)`
- `-1, -2, -3`
- `_1, _2, _3`
- No numbering

### Filename cleanup
You can clean the prefix with:

- Replace spaces with `_`
- Remove symbols (keeps `a-z A-Z 0-9 _ -`)
- Lowercase

### Dark mode
Toggle dark mode from the navbar. The choice is remembered in your browser (localStorage).

---

## Tech Stack

- **Backend:** Flask (Python)
- **Frontend:** HTML + CSS + Vanilla JS
- **Fonts:** Ubuntu Mono (body), Raleway (title/buttons)

---

## Project Structure

```text
RenameIt/
├─ app.py
├─ templates/
│  └─ index.html
└─ static/
   ├─ style.css
   ├─ dark.css
   ├─ script.js
   └─ GitHub.svg
```

---

## Getting Started (Windows)

### 1) Create and activate a virtual environment (recommended)

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 2) Install dependencies

If you have a `requirements.txt`:

```powershell
pip install -r requirements.txt
```

If you don’t, install Flask directly:

```powershell
pip install flask werkzeug
```

### 3) Run the app

```powershell
python app.py
```

Then open:

- http://127.0.0.1:5000

---

## How to Use

1. Drag & drop files into the drop area (or click it to browse)
2. Enter a **Prefix**
3. Choose **Numbering Style** (+ digits for padded styles)
4. Choose **Filename Cleanup** options
5. Verify the **Preview**
6. Click **RENAME & DOWNLOAD**

---

## Notes

- Upload limit is set to **10MB** per request in `app.py` (`MAX_CONTENT_LENGTH`).
- If the chosen naming scheme produces duplicate filenames, RenameIt automatically adds a suffix like `_2`, `_3`, etc. inside the ZIP.

---

## Author

Made by **Prashant Ahirwar**

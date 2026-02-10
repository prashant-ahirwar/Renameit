from flask import Flask, render_template, request, send_file
import os
import zipfile
import re
import io
from werkzeug.utils import secure_filename

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(
    __name__,
    template_folder=BASE_DIR,
    static_folder=os.path.join(BASE_DIR, "static"),
)

# ------------------------
# Config
# ------------------------
UPLOAD_FOLDER = "uploads"
ZIP_NAME = "renamed_files.zip"

app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10MB upload limit

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def clean_text(text, options):
    result = text

    if "spaces" in options:
        result = re.sub(r"\s+", "_", result)

    if "symbols" in options:
        result = re.sub(r"[^a-zA-Z0-9_-]", "", result)

    if "lowercase" in options:
        result = result.lower()

    return result


def build_new_filename(prefix, ext, counter, numbering_style, digits):

    style = (numbering_style or "pad").strip().lower()
    try:
        digits_i = int(digits)
    except (TypeError, ValueError):
        digits_i = 3
    digits_i = max(1, min(digits_i, 10))

    padded = str(counter).zfill(digits_i)

    if style == "none":
        return f"{prefix}{ext}"
    if style == "paren":
        return f"{prefix}_({counter}){ext}"
    if style == "dash":
        return f"{prefix}-{counter}{ext}"
    if style == "underscore":
        return f"{prefix}_{counter}{ext}"
    # pad + pad-dot default to padded numbering
    return f"{prefix}_{padded}{ext}"


def ensure_unique_name(used_names, filename):
    if filename not in used_names:
        used_names.add(filename)
        return filename

    base, ext = os.path.splitext(filename)
    i = 2
    while True:
        alt = f"{base}_{i}{ext}"
        if alt not in used_names:
            used_names.add(alt)
            return alt
        i += 1
# ------------------------
# Routes
# ------------------------
@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        files = request.files.getlist("files")
        prefix = request.form.get("prefix", "file")
        numbering_style = request.form.get("numbering_style", "pad")
        digits = request.form.get("digits", "3")
        cleanup = request.form.get("cleanup", "")
        cleanup_options = cleanup.split(",") if cleanup else []

        # Sanitize prefix
        safe_prefix = secure_filename(prefix)
        safe_prefix = clean_text(safe_prefix, cleanup_options)

        if not safe_prefix:
            safe_prefix = "file"

        used_names = set()
        counter = 1

        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zipf:
            for file in files:
                original_name = secure_filename(file.filename)
                if not original_name:
                    continue

                ext = os.path.splitext(original_name)[1].lower()

                new_name = build_new_filename(
                    prefix=safe_prefix,
                    ext=ext,
                    counter=counter,
                    numbering_style=numbering_style,
                    digits=digits,
                )

                new_name = ensure_unique_name(used_names, new_name)

                # Read file bytes and put into zip
                data = file.read()
                if data is None:
                    data = b""
                zipf.writestr(new_name, data)
                counter += 1

        zip_buffer.seek(0)

        return send_file(
            zip_buffer,
            as_attachment=True,
            download_name=ZIP_NAME,
            mimetype="application/zip",
        )

    return render_template("index.html")


# ------------------------
# Run App
# ------------------------
if __name__ == "__main__":
    app.run(debug=True)

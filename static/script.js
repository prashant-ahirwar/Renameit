const filesInput = document.getElementById("files");
const prefixInput = document.getElementById("prefix");
const previewBox = document.getElementById("preview");
const numberingStyleSelect = document.getElementById("numbering-style");
const digitsSelect = document.getElementById("digits");
const form = document.getElementById("rename-form");
const dropZone = document.getElementById("drop-zone");
const fileList = document.getElementById("file-list");
const fileCount = document.getElementById("file-count");

const darkStyle = document.getElementById("dark-style");
const darkToggle = document.getElementById("dark-toggle");
const darkIcon = document.getElementById("dark-icon");

function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"]; 
    const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
    const value = bytes / Math.pow(1024, i);
    const shown = value >= 10 || i === 0 ? value.toFixed(0) : value.toFixed(1);
    return `${shown} ${units[i]}`;
}

// ---------------------
// Preview Logic
// ---------------------
function updatePreview() {
    const files = filesInput.files;
    const rawPrefix = prefixInput.value || "file";
    const cleanupOptions = getCleanupOptions();
    const prefix = cleanText(rawPrefix, cleanupOptions);
    const style = numberingStyleSelect.value;
    const digits = digitsSelect.value;

    previewBox.innerHTML = "";

    renderFileList(files);

    if (!files.length) return;

    let counter = 1;

    Array.from(files).forEach((file) => {
        const dotIndex = file.name.lastIndexOf(".");
        const ext = dotIndex !== -1
            ? file.name.substring(dotIndex).toLowerCase()
            : "";

        const newName = buildNewName({
            prefix,
            ext,
            style,
            digits,
            counter
        });

        const div = document.createElement("div");
        div.textContent = `${file.name} → ${newName}`;
        previewBox.appendChild(div);

        counter++;
    });
}

function renderFileList(files) {
    fileList.innerHTML = "";

    if (!files || !files.length) {
        fileCount.textContent = "No files selected.";
        return;
    }

    fileCount.textContent = `${files.length} file${files.length === 1 ? "" : "s"} selected.`;

    Array.from(files).forEach((f) => {
        const row = document.createElement("div");
        row.className = "file-item";

        const name = document.createElement("div");
        name.className = "file-item__name";
        name.title = f.name;
        name.textContent = f.name;

        const meta = document.createElement("div");
        meta.className = "file-item__meta";
        meta.textContent = formatBytes(f.size);

        row.appendChild(name);
        row.appendChild(meta);
        fileList.appendChild(row);
    });
}

function buildNewName({ prefix, ext, style, digits, counter }) {
    const n = counter;
    const padded = String(n).padStart(parseInt(digits, 10), "0");

    switch (style) {
        case "none":
            return `${prefix}${ext}`;
        case "pad":
            return `${prefix}_${padded}${ext}`;
        case "pad-dot":
            return `${prefix}_${padded}.${ext.startsWith(".") ? ext.slice(1) : ext}`;
        case "paren":
            return `${prefix}_(${n})${ext}`;
        case "dash":
            return `${prefix}-${n}${ext}`;
        case "underscore":
            return `${prefix}_${n}${ext}`;
        default:
            return `${prefix}_${padded}${ext}`;
    }
}
function cleanText(text, options) {
    let result = text;
    if (options.includes("spaces")) {
        result = result.replace(/\s+/g, "_");
    }

    if (options.includes("symbols")) {
        result = result.replace(/[^a-zA-Z0-9_-]/g, "");
    }

    if (options.includes("lowercase")) {
        result = result.toLowerCase();
    }

    return result;
}

function getCleanupOptions() {
    return Array.from(
        document.querySelectorAll("#cleanup-options input:checked")
    ).map(cb => cb.value);
}

function setDarkMode(enabled) {
    darkStyle.disabled = !enabled;
    darkIcon.textContent = enabled ? "☀️" : "🌙";
    try {
        localStorage.setItem("renameit:dark", enabled ? "1" : "0");
    } catch {
        // ignore
    }
}

function getInitialDarkMode() {
    try {
        const saved = localStorage.getItem("renameit:dark");
        if (saved === "1") return true;
        if (saved === "0") return false;
    } catch {
        // ignore
    }
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

// ---------------------
// Events
// ---------------------
filesInput.addEventListener("change", updatePreview);
prefixInput.addEventListener("input", updatePreview);
numberingStyleSelect.addEventListener("change", updatePreview);
digitsSelect.addEventListener("change", updatePreview);

document.querySelectorAll("#cleanup-options input")
    .forEach(cb => cb.addEventListener("change", updatePreview));

form.addEventListener("submit", () => {
    document.getElementById("cleanup").value = getCleanupOptions().join(",");
});

// Click opens file picker
dropZone.addEventListener("click", () => {
    filesInput.click();
});

dropZone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        filesInput.click();
    }
});

// Drag events
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");

    filesInput.files = e.dataTransfer.files;
    updatePreview();
});

// Dark mode
setDarkMode(getInitialDarkMode());
darkToggle.addEventListener("click", () => {
    setDarkMode(darkStyle.disabled);
});

// Initial render
renderFileList(filesInput.files);

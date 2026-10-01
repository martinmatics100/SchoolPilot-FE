/**
 * Parse a CSV string into an array of objects.
 * Handles quoted fields, commas inside quotes, and escaped quotes.
 */
export function parseCSV(csvText: string): string[][] {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = "";
    let insideQuotes = false;

    // Normalize line endings
    const text = csvText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (insideQuotes) {
            if (char === '"' && nextChar === '"') {
                // Escaped quote
                currentField += '"';
                i++;
            } else if (char === '"') {
                insideQuotes = false;
            } else {
                currentField += char;
            }
        } else {
            if (char === '"') {
                insideQuotes = true;
            } else if (char === ",") {
                currentRow.push(currentField);
                currentField = "";
            } else if (char === "\n") {
                currentRow.push(currentField);
                rows.push(currentRow);
                currentRow = [];
                currentField = "";
            } else {
                currentField += char;
            }
        }
    }

    // Push the last field/row if there's content
    if (currentField.length > 0 || currentRow.length > 0) {
        currentRow.push(currentField);
        rows.push(currentRow);
    }

    // Remove fully-empty trailing rows
    return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

/**
 * Convert array of objects to CSV string.
 */
export function toCSV(
    headers: string[],
    rows: (string | number | null | undefined)[][]
): string {
    const escapeCell = (val: any): string => {
        const str = val == null ? "" : String(val);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const headerLine = headers.map(escapeCell).join(",");
    const bodyLines = rows.map((row) => row.map(escapeCell).join(","));
    return [headerLine, ...bodyLines].join("\n");
}

/**
 * Trigger a browser download of a text file.
 */
export function downloadTextFile(
    filename: string,
    content: string,
    mimeType = "text/csv;charset=utf-8;"
) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
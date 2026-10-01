import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const CSV_HEADERS = [
    "FirstName",
    "LastName",
    "Gender",
    "Religious Subject",
    "Language Subject",
] as const;

export const GENDER_OPTIONS = ["Male", "Female"] as const;
export const RELIGIOUS_OPTIONS = ["CRS", "IRS"] as const;
export const LANGUAGE_OPTIONS = ["Hausa", "Yoruba", "Igbo"] as const;

export async function downloadStudentsTemplate() {
    const wb = new ExcelJS.Workbook();
    wb.creator = "School Portal";
    wb.created = new Date();

    // --- Hidden sheet for dropdown source lists ---
    const lists = wb.addWorksheet("Lists", { state: "veryHidden" });
    lists.getCell("A1").value = "Gender";
    lists.getCell("A2").value = "Religious";
    lists.getCell("A3").value = "Language";

    GENDER_OPTIONS.forEach((v, i) => {
        lists.getCell(`${String.fromCharCode(66 + i)}1`).value = v;
    });
    RELIGIOUS_OPTIONS.forEach((v, i) => {
        lists.getCell(`${String.fromCharCode(66 + i)}2`).value = v;
    });
    LANGUAGE_OPTIONS.forEach((v, i) => {
        lists.getCell(`${String.fromCharCode(66 + i)}3`).value = v;
    });

    // --- Main sheet ---
    const ws = wb.addWorksheet("Students", {
        views: [{ state: "frozen", ySplit: 1 }],
    });

    ws.columns = [
        { header: "FirstName", key: "firstName", width: 22 },
        { header: "LastName", key: "lastName", width: 22 },
        { header: "Gender", key: "gender", width: 16 },
        { header: "Religious Subject", key: "religious", width: 20 },
        { header: "Language Subject", key: "language", width: 20 },
    ];

    // Style header
    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1E88E5" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 22;

    // Sample rows
    const samples = [
        { firstName: "John", lastName: "Doe", gender: "Male", religious: "CRS", language: "Yoruba" },
        { firstName: "Jane", lastName: "Smith", gender: "Female", religious: "IRS", language: "Igbo" },
    ];
    samples.forEach((s) => ws.addRow(s));

    // Pre-apply dropdown validation for rows 2..500
    const rangeStart = 2;
    const rangeEnd = 500;

    const genderFormula = `Lists!$B$1:$C$1`;
    const religiousFormula = `Lists!$B$2:$C$2`;
    const languageFormula = `Lists!$B$3:$D$3`;

    for (let row = rangeStart; row <= rangeEnd; row++) {
        ws.getCell(`C${row}`).dataValidation = {
            type: "list",
            allowBlank: true,
            formulae: [genderFormula],
            showErrorMessage: true,
            errorTitle: "Invalid Gender",
            error: "Please select Male or Female.",
        };
        ws.getCell(`D${row}`).dataValidation = {
            type: "list",
            allowBlank: true,
            formulae: [religiousFormula],
            showErrorMessage: true,
            errorTitle: "Invalid Religious Subject",
            error: "Please select CRS or IRS.",
        };
        ws.getCell(`E${row}`).dataValidation = {
            type: "list",
            allowBlank: true,
            formulae: [languageFormula],
            showErrorMessage: true,
            errorTitle: "Invalid Language Subject",
            error: "Please select Hausa, Yoruba, or Igbo.",
        };
    }

    // --- Save ---
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "students_import_template.xlsx");
}
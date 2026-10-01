import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Box,
    Typography,
    Button,
    MenuItem,
    TextField,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Alert,
    CircularProgress,
    IconButton,
    Tooltip,
    Stack,
    Link,
    Divider,
    useTheme,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import ExcelJS from "exceljs";
import { useAuth } from "../../../../context";
import { fetchClasses } from "../../../../api/classServices";
import { createStudentsBulk } from "../../../../api/studentService";
import { parseCSV } from "../../../../utils/csvUtils";
import {
    CSV_HEADERS,
    GENDER_OPTIONS,
    RELIGIOUS_OPTIONS,
    LANGUAGE_OPTIONS,
    downloadStudentsTemplate,
} from "../../../../utils/excelTemplate";

// ---------- Types ----------
type ParsedRow = {
    firstName: string;
    lastName: string;
    gender: string;
    religiousSubject: string;
    languageSubject: string;
};

type ValidatedRow = ParsedRow & {
    _rowNumber: number;
    _errors: string[];
};

// ---------- Helpers ----------
const normalize = (s: string) => (s ?? "").trim();

const canonical = <T extends readonly string[]>(
    list: T,
    val: string
): string | null => {
    const found = list.find((opt) => opt.toLowerCase() === val.toLowerCase());
    return found ?? null;
};

export default function ImportStudents() {
    const theme = useTheme();
    const { selectedAccount } = useAuth();

    // ---------- Theme shortcuts ----------
    const bgDefault = theme.palette.background.default;
    const textSecondary = theme.palette.text.secondary;

    const [classes, setClasses] = useState<any[]>([]);
    const [classId, setClassId] = useState<string>("");
    const [fileName, setFileName] = useState<string>("");
    const [rows, setRows] = useState<ValidatedRow[]>([]);
    const [parseError, setParseError] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [submitMsg, setSubmitMsg] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!selectedAccount) return;
        fetchClasses(selectedAccount).then((data) =>
            setClasses(
                data.map((c: any) => ({
                    id: c.id,
                    name: c.className,
                    classLevel: c.classLevel,
                }))
            )
        );
    }, [selectedAccount]);

    const selectedClass = classes.find((c) => c.id === classId);

    // ---------- Template download ----------
    const handleDownloadTemplate = async () => {
        try {
            setDownloading(true);
            await downloadStudentsTemplate();
        } catch (err) {
            console.error(err);
            setParseError("Failed to generate template. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    // ---------- File handling ----------
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        processFile(file);
        e.target.value = "";
    };

    const processFile = async (file: File) => {
        setParseError("");
        setSubmitMsg(null);
        setFileName(file.name);

        const lower = file.name.toLowerCase();
        const isCsv = lower.endsWith(".csv");
        const isXlsx = lower.endsWith(".xlsx");

        if (!isCsv && !isXlsx) {
            setParseError("Please upload a .csv or .xlsx file.");
            setRows([]);
            return;
        }

        try {
            const parsed: string[][] = isCsv
                ? parseCSV(await file.text())
                : await parseXlsxRows(file);

            handleParsedRows(parsed);
        } catch (err) {
            console.error(err);
            setParseError("Failed to read the file. Please check the format.");
            setRows([]);
        }
    };

    /** Read the first worksheet of an .xlsx file as a string[][] */
    const parseXlsxRows = async (file: File): Promise<string[][]> => {
        const buffer = await file.arrayBuffer();
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(buffer);

        const ws =
            wb.worksheets.find((s) => s.name === "Students") ?? wb.worksheets[0];
        if (!ws) throw new Error("No worksheet found");

        const rows: string[][] = [];
        ws.eachRow({ includeEmpty: false }, (row) => {
            const values: string[] = [];
            const raw = row.values as any[]; // 1-indexed
            for (let i = 1; i < raw.length; i++) {
                const v = raw[i];
                if (v == null) values.push("");
                else if (typeof v === "object" && "text" in v)
                    values.push(String(v.text).trim());
                else if (typeof v === "object" && "result" in v)
                    values.push(String(v.result).trim());
                else values.push(String(v).trim());
            }
            rows.push(values);
        });

        return rows.filter((r) => r.some((c) => c !== ""));
    };

    /** Validate the parsed 2D rows and update state */
    const handleParsedRows = (parsed: string[][]) => {
        if (parsed.length === 0) {
            setParseError("The file is empty.");
            setRows([]);
            return;
        }

        const header = parsed[0].map((h) => normalize(h));
        const missing = CSV_HEADERS.filter(
            (h) => !header.some((c) => c.toLowerCase() === h.toLowerCase())
        );
        if (missing.length > 0) {
            setParseError(
                `Missing required column(s): ${missing.join(
                    ", "
                )}. Please use the provided template.`
            );
            setRows([]);
            return;
        }

        const idx: Record<string, number> = {};
        CSV_HEADERS.forEach((h) => {
            idx[h] = header.findIndex(
                (c) => c.toLowerCase() === h.toLowerCase()
            );
        });

        const validated: ValidatedRow[] = [];
        for (let i = 1; i < parsed.length; i++) {
            const raw = parsed[i];
            const get = (col: (typeof CSV_HEADERS)[number]) =>
                normalize(raw[idx[col]] ?? "");

            const r: ValidatedRow = {
                firstName: get("FirstName"),
                lastName: get("LastName"),
                gender: get("Gender"),
                religiousSubject: get("Religious Subject"),
                languageSubject: get("Language Subject"),
                _rowNumber: i + 1,
                _errors: [],
            };

            if (!r.firstName) r._errors.push("FirstName is required");
            if (!r.lastName) r._errors.push("LastName is required");

            const g = canonical(GENDER_OPTIONS, r.gender);
            if (!r.gender) r._errors.push("Gender is required");
            else if (!g)
                r._errors.push(`Gender must be one of: ${GENDER_OPTIONS.join(", ")}`);
            else r.gender = g;

            const rel = canonical(RELIGIOUS_OPTIONS, r.religiousSubject);
            if (!r.religiousSubject)
                r._errors.push("Religious Subject is required");
            else if (!rel)
                r._errors.push(
                    `Religious Subject must be one of: ${RELIGIOUS_OPTIONS.join(", ")}`
                );
            else r.religiousSubject = rel;

            const lang = canonical(LANGUAGE_OPTIONS, r.languageSubject);
            if (!r.languageSubject)
                r._errors.push("Language Subject is required");
            else if (!lang)
                r._errors.push(
                    `Language Subject must be one of: ${LANGUAGE_OPTIONS.join(", ")}`
                );
            else r.languageSubject = lang;

            validated.push(r);
        }

        if (validated.length === 0) {
            setParseError("No data rows found in the file.");
            setRows([]);
            return;
        }

        setRows(validated);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!classId) return;
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleClear = () => {
        setRows([]);
        setFileName("");
        setParseError("");
        setSubmitMsg(null);
    };

    // ---------- Derived ----------
    const invalidCount = useMemo(
        () => rows.filter((r) => r._errors.length > 0).length,
        [rows]
    );
    const validCount = rows.length - invalidCount;
    const canSubmit =
        !!classId && rows.length > 0 && invalidCount === 0 && !submitting;

    // ---------- Submit ----------
    const handleSubmit = async () => {
        if (!canSubmit) return;
        setSubmitting(true);
        setSubmitMsg(null);

        try {
            const payload = {
                classRoomId: classId,
                students: rows.map((r) => ({
                    firstName: r.firstName,
                    lastName: r.lastName,
                    gender: r.gender,
                    religiousSubject: r.religiousSubject,
                    languageSubject: r.languageSubject,
                })),
            };

            await createStudentsBulk(selectedAccount, payload);

            setSubmitMsg({
                type: "success",
                text: `Successfully imported ${rows.length} student(s) into ${selectedClass?.name ?? "the class"
                    }.`,
            });
            handleClear();
        } catch (err: any) {
            console.error(err);
            setSubmitMsg({
                type: "error",
                text:
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to import students.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    // ---------- Render ----------
    return (
        <Box
            sx={{
                maxWidth: 1100,
                mx: "auto",
                px: { xs: 2, sm: 3 },
                py: { xs: 3, sm: 4 },
                bgcolor: bgDefault,
                color: textSecondary,
            }}
        >
            {/* ===== Header ===== */}
            <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={1}
                mb={3}
            >
                <Box>
                    <Typography variant="h5" fontWeight={700} color="text.primary">
                        Import Students
                    </Typography>
                    <Typography variant="body2" sx={{ color: textSecondary }}>
                        Download the template, fill it in, then upload it (.xlsx or .csv).
                    </Typography>
                </Box>

                <Tooltip title="Pre-formatted Excel template with dropdowns">
                    <Link
                        component="button"
                        type="button"
                        underline="hover"
                        onClick={handleDownloadTemplate}
                        disabled={downloading}
                        sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.75,
                            fontSize: 14,
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                            color: theme.palette.primary.main,
                        }}
                    >
                        {downloading ? (
                            <CircularProgress size={14} />
                        ) : (
                            <DownloadIcon fontSize="small" />
                        )}
                        Download template
                    </Link>
                </Tooltip>
            </Stack>

            {/* ===== Step 1: Class selection ===== */}
            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    mb: 2.5,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: { xs: "stretch", sm: "center" },
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                    bgcolor: bgDefault,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor: bgDefault,
                        border: `1px solid ${theme.palette.divider}`,
                        color: theme.palette.primary.main,
                        flexShrink: 0,
                    }}
                >
                    <SchoolOutlinedIcon fontSize="small" />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        variant="caption"
                        sx={{
                            color: textSecondary,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                            fontWeight: 600,
                        }}
                    >
                        Step 1
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="text.primary">
                        Select the class
                    </Typography>
                </Box>

                <TextField
                    select
                    size="small"
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    placeholder="Choose class"
                    SelectProps={{ displayEmpty: true }}
                    sx={{
                        width: { xs: "100%", sm: 220 },
                        bgcolor: bgDefault,
                        "& .MuiInputBase-root": { bgcolor: bgDefault },
                        "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: theme.palette.divider,
                        },
                        "& .MuiInputBase-input": {
                            color: textSecondary,
                        },
                    }}
                >
                    <MenuItem value="">
                        <em>Choose class</em>
                    </MenuItem>
                    {classes.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                            {c.name}
                        </MenuItem>
                    ))}
                </TextField>
            </Paper>

            {/* ===== Step 2: Upload ===== */}
            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    mb: 2.5,
                    borderRadius: 2,
                    bgcolor: bgDefault,
                }}
            >
                <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            bgcolor: bgDefault,
                            border: `1px solid ${theme.palette.divider}`,
                            color: classId ? theme.palette.primary.main : textSecondary,
                            flexShrink: 0,
                        }}
                    >
                        <InsertDriveFileOutlinedIcon fontSize="small" />
                    </Box>
                    <Box>
                        <Typography
                            variant="caption"
                            sx={{
                                color: textSecondary,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                                fontWeight: 600,
                            }}
                        >
                            Step 2
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="text.primary">
                            Upload the filled file
                        </Typography>
                    </Box>
                </Stack>

                {/* Drop zone */}
                <Tooltip
                    title={!classId ? "Select a class first to upload students" : ""}
                    arrow
                    placement="top"
                >
                    <Box
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => classId && fileInputRef.current?.click()}
                        sx={{
                            border: "2px dashed",
                            borderColor: classId
                                ? theme.palette.primary.main
                                : theme.palette.divider,
                            borderRadius: 2,
                            p: { xs: 3, sm: 4 },
                            textAlign: "center",
                            cursor: classId ? "pointer" : "not-allowed",
                            opacity: classId ? 1 : 0.55,
                            bgcolor: bgDefault,
                            transition: "all 0.15s ease",
                            "&:hover": classId
                                ? {
                                    borderColor: theme.palette.primary.dark,
                                    bgcolor: bgDefault,
                                }
                                : {},
                        }}
                    >
                        <CloudUploadIcon
                            sx={{
                                fontSize: 40,
                                color: classId ? theme.palette.primary.main : textSecondary,
                            }}
                        />
                        <Typography
                            variant="body1"
                            mt={1}
                            fontWeight={500}
                            sx={{ color: classId ? theme.palette.text.primary : textSecondary }}
                        >
                            {fileName
                                ? `Selected: ${fileName}`
                                : classId
                                    ? "Click to choose, or drag & drop a file"
                                    : "Select a class to enable upload"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: textSecondary }}>
                            Accepts .csv or .xlsx (use the downloaded template)
                        </Typography>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            hidden
                            onChange={handleFileChange}
                            disabled={!classId}
                        />
                    </Box>
                </Tooltip>

                {parseError && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {parseError}
                    </Alert>
                )}
            </Paper>

            {/* ===== Step 3: Preview ===== */}
            {rows.length > 0 && (
                <Paper
                    variant="outlined"
                    sx={{ p: 2, mb: 2.5, borderRadius: 2, bgcolor: bgDefault }}
                >
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        spacing={1}
                        mb={2}
                    >
                        <Box>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: textSecondary,
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                    fontWeight: 600,
                                }}
                            >
                                Step 3
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color="text.primary">
                                Review & confirm
                            </Typography>
                        </Box>

                        <Stack direction="row" spacing={1} alignItems="center">
                            <Chip size="small" color="success" label={`${validCount} valid`} />
                            {invalidCount > 0 && (
                                <Chip size="small" color="error" label={`${invalidCount} invalid`} />
                            )}
                            <Tooltip title="Remove file">
                                <IconButton size="small" onClick={handleClear}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Stack>

                    <TableContainer
                        sx={{
                            maxHeight: 420,
                            borderRadius: 1,
                            border: "1px solid",
                            borderColor: theme.palette.divider,
                            bgcolor: bgDefault,
                        }}
                    >
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    {[
                                        "#",
                                        "First Name",
                                        "Last Name",
                                        "Gender",
                                        "Religious",
                                        "Language",
                                        "Status",
                                    ].map((label) => (
                                        <TableCell
                                            key={label}
                                            sx={{
                                                fontWeight: 600,
                                                bgcolor: bgDefault,
                                                color: textSecondary,
                                            }}
                                        >
                                            {label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((r) => {
                                    const hasErr = r._errors.length > 0;
                                    return (
                                        <TableRow
                                            key={r._rowNumber}
                                            sx={
                                                hasErr
                                                    ? { bgcolor: "error.50" }
                                                    : { bgcolor: bgDefault }
                                            }
                                        >
                                            <TableCell sx={{ color: textSecondary }}>
                                                {r._rowNumber}
                                            </TableCell>
                                            <TableCell sx={{ color: textSecondary }}>
                                                {r.firstName || "—"}
                                            </TableCell>
                                            <TableCell sx={{ color: textSecondary }}>
                                                {r.lastName || "—"}
                                            </TableCell>
                                            <TableCell sx={{ color: textSecondary }}>
                                                {r.gender || "—"}
                                            </TableCell>
                                            <TableCell sx={{ color: textSecondary }}>
                                                {r.religiousSubject || "—"}
                                            </TableCell>
                                            <TableCell sx={{ color: textSecondary }}>
                                                {r.languageSubject || "—"}
                                            </TableCell>
                                            <TableCell>
                                                {hasErr ? (
                                                    <Typography variant="caption" color="error">
                                                        {r._errors.join("; ")}
                                                    </Typography>
                                                ) : (
                                                    <Chip size="small" color="success" label="OK" />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* ===== Footer / Submit ===== */}
            <Divider sx={{ my: 3 }} />

            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", sm: "center" }}
                justifyContent="space-between"
            >
                <Box>
                    {selectedClass && (
                        <Typography variant="body2" sx={{ color: textSecondary }}>
                            Importing into:{" "}
                            <strong style={{ color: theme.palette.text.primary }}>
                                {selectedClass.name}
                            </strong>
                        </Typography>
                    )}
                    {!classId && (
                        <Typography variant="body2" sx={{ color: textSecondary }}>
                            Select a class to begin.
                        </Typography>
                    )}
                </Box>

                <Button
                    variant="contained"
                    size="large"
                    disabled={!canSubmit}
                    onClick={handleSubmit}
                    startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
                    sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        px: 3,
                        width: { xs: "100%", sm: "auto" },
                    }}
                >
                    {submitting
                        ? "Importing..."
                        : rows.length > 0
                            ? `Import ${rows.length} student${rows.length === 1 ? "" : "s"}`
                            : "Import students"}
                </Button>
            </Stack>

            {submitMsg && (
                <Alert severity={submitMsg.type} sx={{ mt: 2 }}>
                    {submitMsg.text}
                </Alert>
            )}
        </Box>
    );
}
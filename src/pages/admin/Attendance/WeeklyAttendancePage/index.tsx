import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    IconButton,
    Tooltip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    useTheme,
    alpha,
    Skeleton,
    Button,
    Tabs,
    Tab,
    Chip,
    useMediaQuery,
    Collapse,
    CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useAuth } from "../../../../context";
import { fetchClasses } from "../../../../api/classServices";
import { SchoolService } from "../../../../api/schoolService";
import { fetchClassAffectiveSkills } from "../../../../api/studentService";
import {
    fetchClassWeeklyAttendance,
    type WeeklyAttendanceStudent,
} from "../../../../api/attendanceService";
import { useEnums } from "../../../../hooks/useEnums";

/* ─────────────────────────────────────────────────────────────
   CONFIG
   ───────────────────────────────────────────────────────────── */
const WEEKS_PER_PAGE = 4;

/* ─────────────────────────────────────────────────────────────
   TYPES
   ───────────────────────────────────────────────────────────── */
type DayStatus = "present" | "absent" | null;

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    studentId: string;
    photoUrl?: string;
}

interface ClassOption {
    id: string;
    name: string;
}

type AttendanceMap = Record<string, Record<string, "present" | "absent">>;

/* ─────────────────────────────────────────────────────────────
   STATUS COLORS
   ───────────────────────────────────────────────────────────── */
const STATUS_COLORS = {
    present: { icon: "#2e7d32", bg: "#e8f5e9", text: "#2e7d32" },
    absent: { icon: "#c62828", bg: "#ffebee", text: "#c62828" },
    partial: { bg: "#fff8e1", text: "#a15c00" },
};

/* ─────────────────────────────────────────────────────────────
   WEEK SUMMARY TYPES + HELPERS
   ───────────────────────────────────────────────────────────── */
interface DaySummary {
    present: number;
    absent: number;
}

interface WeekSummary {
    days: DaySummary[];
    totalPresent: number;
    totalAbsent: number;
    presentPct: number;
    absentPct: number;
}

function summariseWeek(
    week: Date[],
    students: Student[],
    attendance: AttendanceMap
): WeekSummary {
    const days: DaySummary[] = week.map(() => ({ present: 0, absent: 0 }));

    students.forEach((student) => {
        week.forEach((day, dIdx) => {
            const status = attendance[student.id]?.[toIso(day)];
            if (status === "present") days[dIdx].present++;
            else if (status === "absent") days[dIdx].absent++;
        });
    });

    const totalPresent = days.reduce((sum, d) => sum + d.present, 0);
    const totalAbsent = days.reduce((sum, d) => sum + d.absent, 0);

    const { presentPct, absentPct } = splitPercentages(totalPresent, totalAbsent);
    return { days, totalPresent, totalAbsent, presentPct, absentPct };
}

function splitPercentages(
    a: number,
    b: number
): { presentPct: number; absentPct: number } {
    const total = a + b;
    if (total === 0) return { presentPct: 0, absentPct: 0 };

    const rawA = (a / total) * 100;
    const rawB = (b / total) * 100;

    let pctA = Math.floor(rawA);
    let pctB = Math.floor(rawB);
    const remainder = 100 - (pctA + pctB);

    const remainders = [
        { key: "a" as const, rem: rawA - pctA },
        { key: "b" as const, rem: rawB - pctB },
    ].sort((x, y) => y.rem - x.rem);

    for (let i = 0; i < remainder; i++) {
        if (remainders[i % 2].key === "a") pctA++;
        else pctB++;
    }
    return { presentPct: pctA, absentPct: pctB };
}

/* ─────────────────────────────────────────────────────────────
   DATE HELPERS
   ───────────────────────────────────────────────────────────── */
function toIso(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function startOfWeekMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
}

function addDays(d: Date, n: number): Date {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + n);
    return copy;
}

function formatShort(d: Date): string {
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function formatRange(monday: Date, friday: Date): string {
    return `${formatShort(monday)} – ${formatShort(friday)}`;
}

function buildWeeks(termStart: Date, termEnd: Date): Date[][] {
    const weeks: Date[][] = [];
    let cursor = startOfWeekMonday(termStart);

    let safety = 0;
    while (cursor <= termEnd && safety < 200) {
        const days: Date[] = [];
        for (let d = 0; d < 5; d++) {
            const day = addDays(cursor, d);
            if (day <= termEnd) days.push(day);
        }
        if (days.length > 0) weeks.push(days);
        cursor = addDays(cursor, 7);
        safety++;
    }

    return weeks;
}

const DAY_LABELS = ["M", "T", "W", "Th", "F"];
const DAY_FULL = ["Mon", "Tue", "Wed", "Thu", "Fri"];

/* ─────────────────────────────────────────────────────────────
   STATUS NORMALIZATION (enum-aware)
   ─────────────────────────────────────────────────────────────
   BE can send status as:
     - string: "Present" | "Absent"       (with JsonStringEnumConverter)
     - number: 1 | 2                       (default enum serialization)
     - null:   no record for that day
   We normalize everything to "present" | "absent" | null.
   The enum values are read from local-storage-derived `enums`.
   ───────────────────────────────────────────────────────────── */
function normalizeStatus(
    raw: unknown,
    nameByValue: Record<string, string>
): "present" | "absent" | null {
    if (raw === null || raw === undefined) return null;

    // Numeric path: look up enum name by value
    if (typeof raw === "number") {
        const name = nameByValue[String(raw)];
        if (!name) return null;
        return toFeStatus(name);
    }

    // String path: could be "Present" or the numeric string "1"
    if (typeof raw === "string") {
        if (/^\d+$/.test(raw)) {
            const name = nameByValue[raw];
            if (!name) return null;
            return toFeStatus(name);
        }
        return toFeStatus(raw);
    }

    return null;
}

function toFeStatus(name: string): "present" | "absent" | null {
    const n = name.trim().toLowerCase();
    if (n === "present") return "present";
    if (n === "absent") return "absent";
    return null; // anything else (Late, Excused) → neutral dot
}

/* ─────────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────────── */
const WeeklyAttendancePage: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const { selectedAccount } = useAuth();
    const { enums, isLoading: isEnumsLoading } = useEnums({
        fetchPermissionData: false,
    });

    const bgDefault = theme.palette.background.default;
    const textSecondary = theme.palette.text.secondary;

    // Term info
    const [termStart, setTermStart] = useState<Date | null>(null);
    const [termEnd, setTermEnd] = useState<Date | null>(null);
    const [isLoadingTerm, setIsLoadingTerm] = useState(true);

    // Classes
    const [classes, setClasses] = useState<ClassOption[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const [isLoadingClasses, setIsLoadingClasses] = useState(true);

    // Students
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);

    // Attendance
    const [attendance, setAttendance] = useState<AttendanceMap>({});
    const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);

    // Paging
    const [pageIndex, setPageIndex] = useState(0);
    const [mobileWeekIndex, setMobileWeekIndex] = useState(0);

    const [error, setError] = useState<string>("");

    /* ─────────────────────────────────────────────────────────
       Enum map: { "1": "Present", "2": "Absent" }
       Built from local-storage-backed `enums.AttendanceStatus`.
       Same pattern as StudentList.tsx.
       ───────────────────────────────────────────────────────── */
    const statusNameByValue = useMemo(() => {
        const map: Record<string, string> = {};
        enums?.AttendanceStatus?.forEach((item: any) => {
            map[String(item.value)] = item.name || item.displayName;
        });
        return map;
    }, [enums]);

    /* ── 1. Load term dates ── */
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                setIsLoadingTerm(true);
                const info = await SchoolService.getSchoolInfo();
                if (cancelled) return;

                const rawStart = info?.currentTermStartDate;
                const rawEnd = info?.currentTermEndDate;

                const s = rawStart ? new Date(rawStart) : null;
                const e = rawEnd ? new Date(rawEnd) : null;

                const fallbackStart = startOfWeekMonday(new Date());
                const fallbackEnd = addDays(fallbackStart, 13 * 7 - 1);

                setTermStart(s && !isNaN(s.getTime()) ? s : fallbackStart);
                setTermEnd(e && !isNaN(e.getTime()) ? e : fallbackEnd);
            } catch (err) {
                console.error("Failed to load school info:", err);
                const fallbackStart = startOfWeekMonday(new Date());
                const fallbackEnd = addDays(fallbackStart, 13 * 7 - 1);
                setTermStart(fallbackStart);
                setTermEnd(fallbackEnd);
            } finally {
                if (!cancelled) setIsLoadingTerm(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    /* ── 2. Load classes, auto-select first ── */
    useEffect(() => {
        if (!selectedAccount) return;
        let cancelled = false;

        const load = async () => {
            try {
                setIsLoadingClasses(true);
                const data = await fetchClasses(selectedAccount);
                if (cancelled) return;

                const mapped: ClassOption[] = data.map((c: any) => ({
                    id: c.id,
                    name: c.className,
                }));
                setClasses(mapped);

                if (mapped.length > 0) {
                    setSelectedClassId(mapped[0].id);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error("Failed to load classes:", err);
                    setError("Failed to load classes.");
                }
            } finally {
                if (!cancelled) setIsLoadingClasses(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, [selectedAccount]);

    /* ── 3. Load students via the affective skills endpoint ── */
    useEffect(() => {
        if (!selectedAccount || !selectedClassId) {
            setStudents([]);
            return;
        }
        let cancelled = false;

        const load = async () => {
            try {
                setIsLoadingStudents(true);
                setError("");

                const response: any = await fetchClassAffectiveSkills(
                    selectedAccount,
                    selectedClassId
                );
                if (cancelled) return;

                const list: any[] = Array.isArray(response)
                    ? response
                    : response?.students ?? [];

                const mapped: Student[] = list
                    .filter((s: any) => s && s.studentId)
                    .map((s: any) => {
                        const fullName: string = (s.name ?? "").trim();
                        const parts = fullName.split(/\s+/).filter(Boolean);
                        const firstName = parts[0] ?? "";
                        const lastName = parts.slice(1).join(" ") || firstName;

                        return {
                            id: s.studentId,
                            firstName,
                            lastName,
                            studentId: (s.studentId ?? "—").slice(0, 8),
                        };
                    });

                setStudents(mapped);
                setMobileWeekIndex(0);
                setPageIndex(0);
            } catch (err) {
                if (!cancelled) {
                    console.error("Failed to load students:", err);
                    setError("Failed to load students for this class.");
                    setStudents([]);
                }
            } finally {
                if (!cancelled) setIsLoadingStudents(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, [selectedAccount, selectedClassId]);

    /* ── 4. Load weekly attendance via new endpoint ── */
    useEffect(() => {
        if (
            !selectedAccount ||
            !selectedClassId ||
            !termStart ||
            !termEnd ||
            students.length === 0
        ) {
            setAttendance({});
            return;
        }

        let cancelled = false;

        const load = async () => {
            try {
                setIsLoadingAttendance(true);

                const response = await fetchClassWeeklyAttendance(
                    selectedAccount,
                    selectedClassId,
                    toIso(termStart),
                    toIso(termEnd)
                );

                if (cancelled) return;

                const map: AttendanceMap = {};
                const rows: WeeklyAttendanceStudent[] = response?.students ?? [];

                rows.forEach((row) => {
                    map[row.studentId] = {};

                    Object.entries(row.days ?? {}).forEach(([iso, raw]) => {
                        const normalized = normalizeStatus(raw, statusNameByValue);
                        if (normalized === "present" || normalized === "absent") {
                            map[row.studentId][iso] = normalized;
                        }
                    });
                });

                setAttendance(map);
            } catch (err) {
                console.error("Failed to load weekly attendance:", err);
                if (!cancelled) {
                    setAttendance({});
                }
            } finally {
                if (!cancelled) setIsLoadingAttendance(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [
        selectedAccount,
        selectedClassId,
        termStart,
        termEnd,
        students.length,
        statusNameByValue,
    ]);

    /* ── 5. Build all weeks ── */
    const allWeeks: Date[][] = useMemo(() => {
        if (!termStart || !termEnd) return [];
        return buildWeeks(termStart, termEnd);
    }, [termStart, termEnd]);

    /* ── 6. Page slice ── */
    const totalPages = Math.max(
        1,
        Math.ceil(allWeeks.length / WEEKS_PER_PAGE)
    );

    const visibleWeeks = useMemo(() => {
        const start = pageIndex * WEEKS_PER_PAGE;
        return allWeeks.slice(start, start + WEEKS_PER_PAGE);
    }, [allWeeks, pageIndex]);

    /* ── 7. Pagers ── */
    const goPrev = () => setPageIndex((p) => Math.max(0, p - 1));
    const goNext = () =>
        setPageIndex((p) => Math.min(totalPages - 1, p + 1));

    const handleClassChange = (id: string) => {
        setSelectedClassId(id);
    };

    /* ── 8. Range label ── */
    const rangeLabel = useMemo(() => {
        if (!termStart || !termEnd) return "—";
        const startLabel = formatShort(termStart);
        const endLabel = formatShort(termEnd);
        const year = termEnd.getFullYear();
        return `${startLabel} – ${endLabel}, ${year} · ${allWeeks.length} week${allWeeks.length === 1 ? "" : "s"
            }`;
    }, [termStart, termEnd, allWeeks.length]);

    const isLoadingAnything =
        isLoadingTerm ||
        isLoadingClasses ||
        isLoadingStudents ||
        isLoadingAttendance ||
        isEnumsLoading;

    return (
        <Box
            sx={{
                p: { xs: 1.5, sm: 2, md: 3 },
                bgcolor: bgDefault,
                minHeight: "100vh",
            }}
        >
            {/* ── Header ── */}
            <Box
                sx={{
                    mb: 2,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1.5,
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Box sx={{ minWidth: 0, flex: "1 1 auto" }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            lineHeight: 1.2,
                            color: theme.palette.text.primary,
                        }}
                    >
                        Weekly Attendance
                    </Typography>
                    <Typography variant="caption" sx={{ color: textSecondary }}>
                        {rangeLabel}
                    </Typography>
                </Box>

                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    sx={{ width: { xs: "100%", sm: "auto" } }}
                >
                    <FormControl
                        size="small"
                        sx={{ minWidth: { xs: "100%", sm: 180 } }}
                        disabled={isLoadingClasses || classes.length === 0}
                    >
                        <InputLabel id="class-select-label">Class</InputLabel>
                        <Select
                            labelId="class-select-label"
                            label="Class"
                            value={selectedClassId}
                            onChange={(e) => handleClassChange(e.target.value)}
                        >
                            {classes.length === 0 ? (
                                <MenuItem value="" disabled>
                                    No classes available
                                </MenuItem>
                            ) : (
                                classes.map((c) => (
                                    <MenuItem key={c.id} value={c.id}>
                                        {c.name}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>

                    <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        justifyContent={{ xs: "space-between", sm: "flex-start" }}
                    >
                        <Tooltip title={`Previous ${WEEKS_PER_PAGE} weeks`}>
                            <span>
                                <IconButton
                                    onClick={goPrev}
                                    size="small"
                                    disabled={pageIndex === 0}
                                >
                                    <ChevronLeftIcon />
                                </IconButton>
                            </span>
                        </Tooltip>

                        <Typography
                            variant="caption"
                            sx={{ px: 1, color: textSecondary, fontWeight: 600 }}
                        >
                            {totalPages > 0
                                ? `${pageIndex + 1} / ${totalPages}`
                                : "—"}
                        </Typography>

                        <Tooltip title={`Next ${WEEKS_PER_PAGE} weeks`}>
                            <span>
                                <IconButton
                                    onClick={goNext}
                                    size="small"
                                    disabled={pageIndex >= totalPages - 1}
                                >
                                    <ChevronRightIcon />
                                </IconButton>
                            </span>
                        </Tooltip>

                        <Button
                            size="small"
                            variant="contained"
                            startIcon={<FileDownloadIcon />}
                            onClick={() => console.log("Export clicked")}
                            sx={{ display: { xs: "none", sm: "inline-flex" } }}
                        >
                            Export
                        </Button>
                    </Stack>
                </Stack>
            </Box>

            {/* ── Error ── */}
            {error && (
                <Box
                    sx={{
                        mb: 2,
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: alpha(STATUS_COLORS.absent.bg, 0.6),
                        color: STATUS_COLORS.absent.text,
                        border: `1px solid ${STATUS_COLORS.absent.text}`,
                        fontSize: 13,
                    }}
                >
                    {error}
                </Box>
            )}

            {/* ── Content ── */}
            {isLoadingAnything ? (
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    minHeight={320}
                    gap={2}
                >
                    <CircularProgress />
                    <Typography variant="caption" sx={{ color: textSecondary }}>
                        Loading class, students, and attendance…
                    </Typography>
                </Box>
            ) : students.length === 0 ? (
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    minHeight={240}
                    sx={{
                        borderRadius: 2,
                        border: `1px dashed ${theme.palette.divider}`,
                        bgcolor: bgDefault,
                        p: 4,
                        textAlign: "center",
                    }}
                >
                    <Typography sx={{ color: textSecondary }}>
                        No students in this class yet.
                    </Typography>
                </Box>
            ) : visibleWeeks.length === 0 ? (
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    minHeight={240}
                    sx={{
                        borderRadius: 2,
                        border: `1px dashed ${theme.palette.divider}`,
                        bgcolor: bgDefault,
                        p: 4,
                        textAlign: "center",
                    }}
                >
                    <Typography sx={{ color: textSecondary }}>
                        No weeks available for the current term.
                    </Typography>
                </Box>
            ) : isMobile ? (
                <MobileWeekView
                    weeks={visibleWeeks}
                    weekIndex={mobileWeekIndex}
                    onWeekIndexChange={setMobileWeekIndex}
                    students={students}
                    attendance={attendance}
                    loading={false}
                />
            ) : (
                <DesktopGrid
                    weeks={visibleWeeks}
                    students={students}
                    attendance={attendance}
                    loading={false}
                />
            )}

            {/* ── Legend ── */}
            <Stack
                direction="row"
                spacing={2.5}
                sx={{ mt: 2, flexWrap: "wrap", alignItems: "center" }}
            >
                <LegendItem
                    icon={
                        <CheckCircleIcon
                            sx={{ color: STATUS_COLORS.present.icon, fontSize: 18 }}
                        />
                    }
                    label="Present"
                />
                <LegendItem
                    icon={
                        <CancelIcon
                            sx={{ color: STATUS_COLORS.absent.icon, fontSize: 18 }}
                        />
                    }
                    label="Absent"
                />
                <LegendItem
                    icon={
                        <Box
                            sx={{
                                width: 14,
                                height: 14,
                                borderRadius: "50%",
                                bgcolor: theme.palette.action.disabledBackground,
                                border: `1px solid ${theme.palette.text.disabled}`,
                            }}
                        />
                    }
                    label="No session"
                />
            </Stack>
        </Box>
    );
};

/* ─────────────────────────────────────────────────────────────
   LEGEND ITEM
   ───────────────────────────────────────────────────────────── */
const LegendItem: React.FC<{ icon: React.ReactNode; label: string }> = ({
    icon,
    label,
}) => {
    const theme = useTheme();
    return (
        <Stack direction="row" spacing={0.75} alignItems="center">
            {icon}
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                {label}
            </Typography>
        </Stack>
    );
};

/* ─────────────────────────────────────────────────────────────
   DESKTOP GRID
   ───────────────────────────────────────────────────────────── */
const DesktopGrid: React.FC<{
    weeks: Date[][];
    students: Student[];
    attendance: AttendanceMap;
    loading: boolean;
}> = ({ weeks, students, attendance, loading }) => {
    const theme = useTheme();
    const bgDefault = theme.palette.background.default;
    const textSecondary = theme.palette.text.secondary;
    const divider = theme.palette.divider;

    const summaries = useMemo(
        () => weeks.map((week) => summariseWeek(week, students, attendance)),
        [weeks, students, attendance]
    );

    const SUMMARY_ROW_COUNT = 7;

    const summaryHeaderBg = alpha(theme.palette.primary.main, 0.08);
    const summaryBodyBg = alpha(theme.palette.primary.main, 0.04);

    return (
        <Paper
            sx={{
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: bgDefault,
                boxShadow: theme.shadows[2],
            }}
        >
            <TableContainer
                sx={{
                    overflowX: "auto",
                    overflowY: "auto",
                    maxHeight: "calc(100vh - 200px)",
                    bgcolor: bgDefault,
                    WebkitOverflowScrolling: "touch",
                }}
            >
                <Table
                    stickyHeader
                    size="small"
                    sx={{ minWidth: 900 + (weeks.length - 4) * 200 }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell
                                rowSpan={2}
                                sx={{
                                    fontWeight: 700,
                                    bgcolor: bgDefault,
                                    borderRight: `1px solid ${divider}`,
                                    minWidth: 50,
                                    textAlign: "center",
                                    position: "sticky",
                                    left: 0,
                                    zIndex: 3,
                                    color: textSecondary,
                                }}
                            >
                                SN
                            </TableCell>
                            <TableCell
                                rowSpan={2}
                                sx={{
                                    fontWeight: 700,
                                    bgcolor: bgDefault,
                                    borderRight: `2px solid ${divider}`,
                                    minWidth: 220,
                                    position: "sticky",
                                    left: 50,
                                    zIndex: 3,
                                    color: textSecondary,
                                }}
                            >
                                Student Name
                            </TableCell>

                            {weeks.map((week, wIdx) => (
                                <TableCell
                                    key={wIdx}
                                    colSpan={5}
                                    align="center"
                                    sx={{
                                        fontWeight: 700,
                                        bgcolor: bgDefault,
                                        borderLeft: `1px solid ${divider}`,
                                        borderRight:
                                            wIdx === weeks.length - 1
                                                ? "none"
                                                : `2px solid ${divider}`,
                                        fontSize: 12,
                                        whiteSpace: "nowrap",
                                        color: textSecondary,
                                    }}
                                >
                                    {formatRange(week[0], week[week.length - 1])}
                                </TableCell>
                            ))}
                        </TableRow>

                        <TableRow>
                            {weeks.map((_, wIdx) =>
                                DAY_LABELS.map((label, dIdx) => (
                                    <TableCell
                                        key={`${wIdx}-${dIdx}`}
                                        align="center"
                                        sx={{
                                            bgcolor: bgDefault,
                                            fontWeight: 600,
                                            fontSize: 12,
                                            minWidth: 40,
                                            p: 0.5,
                                            color: textSecondary,
                                            borderLeft:
                                                dIdx === 0 && wIdx > 0
                                                    ? `2px solid ${divider}`
                                                    : "none",
                                        }}
                                    >
                                        {label}
                                    </TableCell>
                                ))
                            )}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading
                            ? Array.from({ length: 6 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <Skeleton width={20} />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton />
                                    </TableCell>
                                    {Array.from({ length: weeks.length * 5 }).map((_, j) => (
                                        <TableCell key={j}>
                                            <Skeleton
                                                variant="circular"
                                                width={22}
                                                height={22}
                                            />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                            : students.map((student, idx) => (
                                <TableRow
                                    key={student.id}
                                    hover
                                    sx={{
                                        "&:nth-of-type(even)": {
                                            bgcolor: alpha(
                                                theme.palette.action.hover,
                                                0.4
                                            ),
                                        },
                                    }}
                                >
                                    <TableCell
                                        align="center"
                                        sx={{
                                            fontSize: 12,
                                            color: textSecondary,
                                            borderRight: `1px solid ${divider}`,
                                            position: "sticky",
                                            left: 0,
                                            bgcolor: bgDefault,
                                            zIndex: 4,
                                        }}
                                    >
                                        {idx + 1}
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            borderRight: `2px solid ${divider}`,
                                            position: "sticky",
                                            left: 50,
                                            bgcolor: bgDefault,
                                            zIndex: 4,
                                        }}
                                    >
                                        <StudentCell student={student} />
                                    </TableCell>

                                    {weeks.map((week, wIdx) =>
                                        week.map((day, dIdx) => {
                                            const iso = toIso(day);
                                            const status =
                                                attendance[student.id]?.[iso] ?? null;
                                            return (
                                                <AttendanceCell
                                                    key={`${student.id}-${wIdx}-${dIdx}`}
                                                    status={status}
                                                    isWeekStart={
                                                        dIdx === 0 && wIdx > 0
                                                    }
                                                />
                                            );
                                        })
                                    )}
                                </TableRow>
                            ))}

                        {!loading &&
                            Array.from({ length: SUMMARY_ROW_COUNT }).map(
                                (_, rowIdx) => (
                                    <TableRow key={`summary-row-${rowIdx}`}>
                                        <TableCell
                                            colSpan={2}
                                            sx={{
                                                position: "sticky",
                                                left: 0,
                                                zIndex: 0,
                                                borderRight: `2px solid ${divider}`,
                                                borderTop:
                                                    rowIdx === 0
                                                        ? `2px solid ${divider}`
                                                        : "none",
                                                borderBottom:
                                                    rowIdx ===
                                                        SUMMARY_ROW_COUNT - 1
                                                        ? `2px solid ${divider}`
                                                        : "none",
                                                fontWeight: 700,
                                                fontSize: 11,
                                                color: textSecondary,
                                                whiteSpace: "nowrap",
                                                bgcolor: bgDefault,
                                                py: 0.5,
                                                verticalAlign: "middle",
                                                textAlign: "center",
                                            }}
                                        >
                                            {rowIdx === 0 && "Week Summary"}
                                        </TableCell>

                                        {weeks.map((week, wIdx) => {
                                            const s = summaries[wIdx];
                                            const cellContent = renderSummaryCell(
                                                rowIdx,
                                                s,
                                                SUMMARY_ROW_COUNT,
                                                textSecondary
                                            );

                                            return (
                                                <TableCell
                                                    key={`summary-${wIdx}-${rowIdx}`}
                                                    colSpan={5}
                                                    align="center"
                                                    sx={{
                                                        bgcolor:
                                                            rowIdx === 0
                                                                ? summaryHeaderBg
                                                                : summaryBodyBg,
                                                        borderLeft:
                                                            wIdx > 0
                                                                ? `2px solid ${divider}`
                                                                : "none",
                                                        borderTop:
                                                            rowIdx === 0
                                                                ? `2px solid ${divider}`
                                                                : "none",
                                                        borderBottom:
                                                            rowIdx ===
                                                                SUMMARY_ROW_COUNT - 1
                                                                ? `2px solid ${divider}`
                                                                : "none",
                                                        p: 0.25,
                                                        fontSize: 10,
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {cellContent}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                )
                            )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

/* ─────────────────────────────────────────────────────────────
   SUMMARY MINI-TABLE
   ───────────────────────────────────────────────────────────── */
function renderSummaryCell(
    rowIdx: number,
    summary: WeekSummary,
    totalRows: number,
    textSecondary: string
): React.ReactNode {
    const rowStyle: React.CSSProperties = {
        display: "grid",
        gridTemplateColumns: "1.6fr 1fr 1fr",
        gap: 2,
        alignItems: "center",
        width: "100%",
        fontSize: 10,
        lineHeight: 1.2,
        padding: "0 2px",
    };

    if (rowIdx === 0) {
        return (
            <div
                style={{
                    ...rowStyle,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.3,
                }}
            >
                <span>Day</span>
                <span style={{ color: STATUS_COLORS.present.text }}>P</span>
                <span style={{ color: STATUS_COLORS.absent.text }}>A</span>
            </div>
        );
    }

    if (rowIdx >= 1 && rowIdx <= 5) {
        const dIdx = rowIdx - 1;
        const d = summary.days[dIdx];

        if (!d) {
            return (
                <div style={rowStyle}>
                    <span style={{ textAlign: "left", color: textSecondary }}>
                        {DAY_FULL[dIdx]}
                    </span>
                    <span style={{ color: textSecondary }}>—</span>
                    <span style={{ color: textSecondary }}>—</span>
                </div>
            );
        }

        return (
            <div style={rowStyle}>
                <span style={{ textAlign: "left", color: textSecondary }}>
                    {DAY_FULL[dIdx]}
                </span>
                <span style={{ color: STATUS_COLORS.present.text, fontWeight: 700 }}>
                    {d.present}
                </span>
                <span style={{ color: STATUS_COLORS.absent.text, fontWeight: 700 }}>
                    {d.absent}
                </span>
            </div>
        );
    }

    return (
        <div
            style={{
                ...rowStyle,
                borderTop: `1px solid rgba(0,0,0,0.08)`,
                paddingTop: 2,
            }}
        >
            <span style={{ fontWeight: 700 }}>Percentage</span>
            <span style={{ color: STATUS_COLORS.present.text, fontWeight: 700 }}>
                {summary.presentPct}%
            </span>
            <span style={{ color: STATUS_COLORS.absent.text, fontWeight: 700 }}>
                {summary.absentPct}%
            </span>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   MOBILE WEEK VIEW
   ───────────────────────────────────────────────────────────── */
const MobileWeekView: React.FC<{
    weeks: Date[][];
    weekIndex: number;
    onWeekIndexChange: (idx: number) => void;
    students: Student[];
    attendance: AttendanceMap;
    loading: boolean;
}> = ({ weeks, weekIndex, onWeekIndexChange, students, attendance, loading }) => {
    const theme = useTheme();
    const bgDefault = theme.palette.background.default;
    const textSecondary = theme.palette.text.secondary;

    const safeIndex = Math.min(weekIndex, Math.max(0, weeks.length - 1));
    const week = weeks[safeIndex] ?? [];
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleExpand = (id: string) =>
        setExpandedId((curr) => (curr === id ? null : id));

    const summary = useMemo(
        () => summariseWeek(week, students, attendance),
        [week, students, attendance]
    );

    return (
        <Box>
            <Box
                sx={{
                    mb: 1.5,
                    overflowX: "auto",
                    WebkitOverflowScrolling: "touch",
                    pb: 0.5,
                }}
            >
                <Tabs
                    value={safeIndex}
                    onChange={(_, v) => onWeekIndexChange(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{
                        minHeight: 40,
                        "& .MuiTab-root": {
                            minHeight: 40,
                            py: 0.5,
                            px: 1.5,
                            minWidth: "auto",
                            fontSize: 12,
                            textTransform: "none",
                            color: textSecondary,
                        },
                        "& .Mui-selected": {
                            color: theme.palette.text.primary,
                        },
                    }}
                >
                    {weeks.map((w, idx) => (
                        <Tab
                            key={idx}
                            label={
                                <Box sx={{ textAlign: "center", lineHeight: 1.2 }}>
                                    <div style={{ fontWeight: 700 }}>Wk {idx + 1}</div>
                                    <div style={{ fontSize: 10, opacity: 0.7 }}>
                                        {formatShort(w[0])}
                                    </div>
                                </Box>
                            }
                        />
                    ))}
                </Tabs>
            </Box>

            <Paper
                elevation={0}
                sx={{
                    mb: 1.5,
                    px: 1.5,
                    py: 1,
                    bgcolor: bgDefault,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1.5,
                }}
            >
                <Typography variant="caption" sx={{ color: textSecondary }}>
                    Week {safeIndex + 1} ·{" "}
                    {week.length > 0
                        ? formatRange(week[0], week[week.length - 1])
                        : "—"}
                </Typography>
            </Paper>

            <WeekSummaryCard week={week} weekIndex={safeIndex} summary={summary} />

            <Stack spacing={1}>
                {loading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} variant="rounded" height={64} />
                    ))
                    : students.map((student, idx) => {
                        const dayStatuses = week.map(
                            (day) => attendance[student.id]?.[toIso(day)] ?? null
                        );
                        const present = dayStatuses.filter((s) => s === "present").length;
                        const total = dayStatuses.filter((s) => s !== null).length;
                        const isExpanded = expandedId === student.id;

                        return (
                            <Paper
                                key={student.id}
                                elevation={0}
                                sx={{
                                    bgcolor: bgDefault,
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: 1.5,
                                    overflow: "hidden",
                                }}
                            >
                                <Box
                                    onClick={() => toggleExpand(student.id)}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.25,
                                        px: 1.25,
                                        py: 1,
                                        cursor: "pointer",
                                        "&:active": {
                                            bgcolor: alpha(
                                                theme.palette.action.active,
                                                0.08
                                            ),
                                        },
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            minWidth: 18,
                                            textAlign: "right",
                                            color: textSecondary,
                                        }}
                                    >
                                        {idx + 1}
                                    </Typography>

                                    <Avatar
                                        sx={{
                                            width: 34,
                                            height: 34,
                                            fontSize: 13,
                                            bgcolor: alpha(
                                                theme.palette.primary.main,
                                                0.12
                                            ),
                                            color: theme.palette.primary.main,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {student.firstName[0]}
                                        {student.lastName[0]}
                                    </Avatar>

                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 600,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                color: theme.palette.text.primary,
                                            }}
                                        >
                                            {student.lastName}, {student.firstName}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{ color: textSecondary }}
                                        >
                                            {student.studentId}
                                        </Typography>
                                    </Box>

                                    <Chip
                                        size="small"
                                        label={`${present}/${total}`}
                                        sx={{
                                            height: 22,
                                            fontSize: 11,
                                            fontWeight: 700,
                                            bgcolor:
                                                present === total && total > 0
                                                    ? STATUS_COLORS.present.bg
                                                    : present === 0
                                                        ? STATUS_COLORS.absent.bg
                                                        : STATUS_COLORS.partial.bg,
                                            color:
                                                present === total && total > 0
                                                    ? STATUS_COLORS.present.text
                                                    : present === 0
                                                        ? STATUS_COLORS.absent.text
                                                        : STATUS_COLORS.partial.text,
                                        }}
                                    />

                                    {isExpanded ? (
                                        <ExpandLessIcon
                                            fontSize="small"
                                            color="action"
                                        />
                                    ) : (
                                        <ExpandMoreIcon
                                            fontSize="small"
                                            color="action"
                                        />
                                    )}
                                </Box>

                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(5, 1fr)",
                                            gap: 0.5,
                                            px: 1.25,
                                            pb: 1.25,
                                            pt: 0.5,
                                            borderTop: `1px solid ${theme.palette.divider}`,
                                            bgcolor: alpha(
                                                theme.palette.action.hover,
                                                0.3
                                            ),
                                        }}
                                    >
                                        {week.map((day, dIdx) => {
                                            const status = dayStatuses[dIdx];
                                            return (
                                                <Box
                                                    key={dIdx}
                                                    sx={{
                                                        textAlign: "center",
                                                        py: 0.75,
                                                        borderRadius: 1,
                                                        bgcolor: bgDefault,
                                                        border: `1px solid ${theme.palette.divider}`,
                                                    }}
                                                >
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            display: "block",
                                                            fontWeight: 600,
                                                            color: textSecondary,
                                                            fontSize: 10,
                                                        }}
                                                    >
                                                        {DAY_FULL[dIdx]}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            display: "block",
                                                            fontSize: 10,
                                                            color: theme.palette
                                                                .text.disabled,
                                                        }}
                                                    >
                                                        {day.getDate()}
                                                    </Typography>
                                                    <Box sx={{ mt: 0.25 }}>
                                                        {status === "present" && (
                                                            <CheckCircleIcon
                                                                sx={{
                                                                    color: STATUS_COLORS
                                                                        .present.icon,
                                                                    fontSize: 20,
                                                                }}
                                                            />
                                                        )}
                                                        {status === "absent" && (
                                                            <CancelIcon
                                                                sx={{
                                                                    color: STATUS_COLORS
                                                                        .absent.icon,
                                                                    fontSize: 20,
                                                                }}
                                                            />
                                                        )}
                                                        {status === null && (
                                                            <Box
                                                                sx={{
                                                                    width: 16,
                                                                    height: 16,
                                                                    mx: "auto",
                                                                    borderRadius: "50%",
                                                                    bgcolor:
                                                                        theme.palette
                                                                            .action
                                                                            .disabledBackground,
                                                                    border: `1px solid ${theme.palette.text.disabled}`,
                                                                }}
                                                            />
                                                        )}
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                </Collapse>
                            </Paper>
                        );
                    })}
            </Stack>
        </Box>
    );
};

/* ─────────────────────────────────────────────────────────────
   WEEK SUMMARY CARD (mobile)
   ───────────────────────────────────────────────────────────── */
const WeekSummaryCard: React.FC<{
    week: Date[];
    weekIndex: number;
    summary: WeekSummary;
}> = ({ week, weekIndex, summary }) => {
    const theme = useTheme();
    const bgDefault = theme.palette.background.default;
    const textSecondary = theme.palette.text.secondary;
    const divider = theme.palette.divider;

    const headerSx = {
        fontWeight: 700,
        fontSize: 11,
        textTransform: "uppercase" as const,
        letterSpacing: 0.5,
        color: textSecondary,
        py: 0.75,
        px: 1,
        borderBottom: `1px solid ${divider}`,
    };

    const cellSx = {
        fontSize: 12,
        py: 0.6,
        px: 1,
        borderBottom: `1px solid ${divider}`,
    };

    return (
        <Paper
            elevation={0}
            sx={{
                mb: 1.5,
                bgcolor: bgDefault,
                border: `1px solid ${divider}`,
                borderRadius: 1.5,
                overflow: "hidden",
            }}
        >
            <Box
                sx={{
                    px: 1.25,
                    py: 0.75,
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                    borderBottom: `1px solid ${divider}`,
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        color: textSecondary,
                    }}
                >
                    Week {weekIndex + 1} · summary
                </Typography>
            </Box>

            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell sx={headerSx}>Day</TableCell>
                        <TableCell sx={{ ...headerSx, textAlign: "center" }}>
                            Present
                        </TableCell>
                        <TableCell sx={{ ...headerSx, textAlign: "center" }}>
                            Absent
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {summary.days.map((d, dIdx) => (
                        <TableRow key={dIdx}>
                            <TableCell sx={cellSx}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: 12,
                                        color: theme.palette.text.primary,
                                    }}
                                >
                                    {DAY_FULL[dIdx]}{" "}
                                    {week[dIdx] && (
                                        <Box
                                            component="span"
                                            sx={{
                                                color: textSecondary,
                                                fontWeight: 400,
                                            }}
                                        >
                                            · {formatShort(week[dIdx])}
                                        </Box>
                                    )}
                                </Typography>
                            </TableCell>
                            <TableCell
                                align="center"
                                sx={{
                                    ...cellSx,
                                    color: STATUS_COLORS.present.text,
                                    fontWeight: 700,
                                }}
                            >
                                {d?.present ?? "—"}
                            </TableCell>
                            <TableCell
                                align="center"
                                sx={{
                                    ...cellSx,
                                    color: STATUS_COLORS.absent.text,
                                    fontWeight: 700,
                                }}
                            >
                                {d?.absent ?? "—"}
                            </TableCell>
                        </TableRow>
                    ))}

                    <TableRow>
                        <TableCell
                            sx={{
                                ...cellSx,
                                fontWeight: 700,
                                bgcolor: alpha(theme.palette.action.hover, 0.3),
                                color: theme.palette.text.primary,
                            }}
                        >
                            Total
                        </TableCell>
                        <TableCell
                            align="center"
                            sx={{
                                ...cellSx,
                                fontWeight: 700,
                                bgcolor: alpha(theme.palette.action.hover, 0.3),
                                color: STATUS_COLORS.present.text,
                            }}
                        >
                            {summary.totalPresent}
                        </TableCell>
                        <TableCell
                            align="center"
                            sx={{
                                ...cellSx,
                                fontWeight: 700,
                                bgcolor: alpha(theme.palette.action.hover, 0.3),
                                color: STATUS_COLORS.absent.text,
                            }}
                        >
                            {summary.totalAbsent}
                        </TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell
                            sx={{
                                ...cellSx,
                                fontWeight: 700,
                                borderBottom: "none",
                                color: theme.palette.text.primary,
                            }}
                        >
                            Percentage
                        </TableCell>
                        <TableCell align="center" sx={{ ...cellSx, borderBottom: "none" }}>
                            <Box
                                sx={{
                                    display: "inline-block",
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: 1,
                                    bgcolor: STATUS_COLORS.present.bg,
                                    color: STATUS_COLORS.present.text,
                                    fontWeight: 700,
                                    fontSize: 12,
                                }}
                            >
                                {summary.presentPct}%
                            </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ ...cellSx, borderBottom: "none" }}>
                            <Box
                                sx={{
                                    display: "inline-block",
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: 1,
                                    bgcolor: STATUS_COLORS.absent.bg,
                                    color: STATUS_COLORS.absent.text,
                                    fontWeight: 700,
                                    fontSize: 12,
                                }}
                            >
                                {summary.absentPct}%
                            </Box>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </Paper>
    );
};

/* ─────────────────────────────────────────────────────────────
   SHARED: Student cell
   ───────────────────────────────────────────────────────────── */
const StudentCell: React.FC<{ student: Student }> = ({ student }) => {
    const theme = useTheme();
    const textSecondary = theme.palette.text.secondary;

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
                sx={{
                    width: 28,
                    height: 28,
                    fontSize: 12,
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                }}
            >
                {student.firstName[0]}
                {student.lastName[0]}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 600,
                        lineHeight: 1.2,
                        whiteSpace: "nowrap",
                        color: theme.palette.text.primary,
                    }}
                >
                    {student.lastName}, {student.firstName}
                </Typography>
                <Typography variant="caption" sx={{ color: textSecondary }}>
                    {student.studentId}
                </Typography>
            </Box>
        </Box>
    );
};

/* ─────────────────────────────────────────────────────────────
   SHARED: Attendance cell
   ───────────────────────────────────────────────────────────── */
const AttendanceCell: React.FC<{
    status: DayStatus;
    isWeekStart: boolean;
}> = ({ status, isWeekStart }) => {
    const theme = useTheme();
    const bgDefault = theme.palette.background.default;

    const baseSx = {
        p: 0.5,
        textAlign: "center",
        verticalAlign: "middle",
        minWidth: 40,
        bgcolor: bgDefault,
        borderLeft: isWeekStart
            ? `2px solid ${theme.palette.divider}`
            : undefined,
    } as const;

    if (status === "present") {
        return (
            <TableCell sx={baseSx}>
                <Tooltip title="Present" arrow>
                    <CheckCircleIcon
                        sx={{
                            color: STATUS_COLORS.present.icon,
                            fontSize: 20,
                            verticalAlign: "middle",
                        }}
                    />
                </Tooltip>
            </TableCell>
        );
    }

    if (status === "absent") {
        return (
            <TableCell sx={baseSx}>
                <Tooltip title="Absent" arrow>
                    <CancelIcon
                        sx={{
                            color: STATUS_COLORS.absent.icon,
                            fontSize: 20,
                            verticalAlign: "middle",
                        }}
                    />
                </Tooltip>
            </TableCell>
        );
    }

    return (
        <TableCell sx={baseSx}>
            <Tooltip title="No session" arrow>
                <Box
                    sx={{
                        width: 16,
                        height: 16,
                        mx: "auto",
                        borderRadius: "50%",
                        bgcolor: theme.palette.action.disabledBackground,
                        border: `1px solid ${theme.palette.text.disabled}`,
                    }}
                />
            </Tooltip>
        </TableCell>
    );
};

export default WeeklyAttendancePage;
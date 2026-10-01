import React, { useEffect, useMemo, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Button,
    Box,
    CircularProgress,
    Typography,
    Stack,
    Tooltip,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

interface ReportPreviewDialogProps {
    open: boolean;
    onClose: () => void;
    /** The PDF blob to display. Null shows a loading state. */
    blob: Blob | null;
    /** Title shown in the dialog header. */
    title?: string;
    /** Optional: allow the user to download the file too. */
    allowDownload?: boolean;
    /** Optional suggested filename (used if download enabled). */
    fileName?: string;
}

const ReportPreviewDialog: React.FC<ReportPreviewDialogProps> = ({
    open,
    onClose,
    blob,
    title = "Report Preview",
    allowDownload = false,
    fileName = "Report.pdf",
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    // Object URL for the PDF
    const [objectUrl, setObjectUrl] = useState<string | null>(null);

    // Create/revoke object URL when blob changes or dialog closes
    useEffect(() => {
        if (!open || !blob) {
            setObjectUrl(null);
            return;
        }
        const url = URL.createObjectURL(blob);
        setObjectUrl(url);

        return () => {
            URL.revokeObjectURL(url);
            setObjectUrl(null);
        };
    }, [open, blob]);

    // Print via a hidden iframe so we don't navigate away
    const handlePrint = () => {
        if (!objectUrl) return;

        // Open the PDF in a hidden iframe and call print() on it
        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        iframe.src = objectUrl;
        document.body.appendChild(iframe);

        iframe.onload = () => {
            setTimeout(() => {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();

                // Clean up after the print dialog closes
                const cleanup = () => {
                    window.removeEventListener("focus", cleanup);
                    setTimeout(() => {
                        document.body.removeChild(iframe);
                    }, 500);
                };
                window.addEventListener("focus", cleanup);
            }, 300);
        };
    };

    const handleDownload = () => {
        if (!objectUrl) return;
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = fileName;
        a.click();
    };

    const handleOpenInNewTab = () => {
        if (!objectUrl) return;
        window.open(objectUrl, "_blank");
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen={isMobile}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    height: isMobile ? "100%" : "92vh",
                    borderRadius: isMobile ? 0 : 2,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                },
            }}
        >
            {/* Header */}
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    py: 1.5,
                    px: 2,
                    backgroundColor: theme.palette.background.default,
                }}
            >
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: "1rem", sm: "1.1rem" } }}>
                        {title}
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={0.5} alignItems="center">
                    <Tooltip title="Open in new tab">
                        <span>
                            <IconButton size="small" onClick={handleOpenInNewTab} disabled={!objectUrl}>
                                <OpenInNewIcon fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>

                    <Tooltip title="Print">
                        <span>
                            <IconButton size="small" onClick={handlePrint} disabled={!objectUrl}>
                                <PrintIcon fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>

                    {allowDownload && (
                        <Tooltip title="Download">
                            <span>
                                <IconButton size="small" onClick={handleDownload} disabled={!objectUrl}>
                                    <DownloadIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                    )}

                    <Tooltip title="Close">
                        <IconButton size="small" onClick={onClose}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </DialogTitle>

            {/* Body — PDF viewer */}
            <DialogContent
                sx={{
                    flex: 1,
                    p: 0,
                    overflow: "hidden",
                    backgroundColor: "#525659", // dark backdrop for the PDF viewer
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {objectUrl ? (
                    <iframe
                        src={objectUrl}
                        title={title}
                        style={{
                            width: "100%",
                            height: "100%",
                            border: "none",
                            display: "block",
                        }}
                    />
                ) : (
                    <Stack alignItems="center" spacing={2}>
                        <CircularProgress color="inherit" sx={{ color: "#fff" }} />
                        <Typography variant="body2" sx={{ color: "#fff" }}>
                            Loading preview…
                        </Typography>
                    </Stack>
                )}
            </DialogContent>

            {/* Footer */}
            <DialogActions
                sx={{
                    borderTop: `1px solid ${theme.palette.divider}`,
                    px: 2,
                    py: 1.5,
                    justifyContent: "space-between",
                }}
            >
                <Typography variant="caption" color="text.secondary">
                    Preview only — no file has been downloaded.
                </Typography>

                <Stack direction="row" spacing={1}>
                    <Button onClick={onClose} sx={{ textTransform: "none", fontWeight: 600 }}>
                        Close
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<PrintIcon />}
                        onClick={handlePrint}
                        disabled={!objectUrl}
                        sx={{ textTransform: "none", fontWeight: 600 }}
                    >
                        Print
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};

export default ReportPreviewDialog;
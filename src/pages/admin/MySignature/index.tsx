import React, { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    Paper,
    Stack,
    Typography,
    Avatar,
    Chip,
    useMediaQuery,
    useTheme,
    IconButton,
    Tooltip,
} from "@mui/material";
import DrawIcon from "@mui/icons-material/Draw";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import UndoIcon from "@mui/icons-material/Undo";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useAuth } from "../../../context";
import { useAssetUpload } from "../../../hooks/useAsset";
import { getMySignature, saveSignature } from "../../../api/userService";
import MessageDisplay from "../../../components/message-display";

const MySignature: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { selectedAccount } = useAuth();

    // 🔥 Reuse the same upload hook from your Create Student page
    const {
        upload,
        isUploading,
        uploadProgress,
        error: uploadError,
        clearError: clearUploadError,
    } = useAssetUpload(selectedAccount);

    const sigPadRef = useRef<SignatureCanvas | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [existingSignatureUrl, setExistingSignatureUrl] = useState<string | null>(null);
    const [hasDrawn, setHasDrawn] = useState(false);

    const [alertMessage, setAlertMessage] = useState<{
        feMessage?: string;
        beMessage?: string;
        httpStatus?: number;
    }>({});

    // ---------- Load existing signature ----------
    useEffect(() => {
        const load = async () => {
            if (!selectedAccount) return;
            setIsLoading(true);
            try {
                const sig = await getMySignature(selectedAccount);
                if (sig?.signatureUrl) setExistingSignatureUrl(sig.signatureUrl);
            } catch {
                // No signature yet — fine
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [selectedAccount]);

    // ---------- Canvas helpers ----------
    const handleClear = () => {
        sigPadRef.current?.clear();
        setHasDrawn(false);
    };

    const handleUndo = () => {
        const data = sigPadRef.current?.toData();
        if (data && data.length > 0) {
            data.pop();
            sigPadRef.current?.fromData(data);
            if (data.length === 0) setHasDrawn(false);
        }
    };

    const handleEnd = () => {
        if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
            setHasDrawn(true);
        }
    };

    /** Convert canvas to a Blob so useAssetUpload can upload it. */
    const canvasToBlob = async (): Promise<Blob | null> => {
        if (!sigPadRef.current) return null;

        // ✅ Use the base canvas directly — no trim dependency
        const canvas = sigPadRef.current.getCanvas();
        const dataUrl = canvas.toDataURL("image/png");

        const res = await fetch(dataUrl);
        return res.blob();
    };

    // ---------- Save flow ----------
    const handleSave = async () => {
        if (!selectedAccount) return;
        if (!sigPadRef.current || sigPadRef.current.isEmpty()) {
            setAlertMessage({
                feMessage: "Please draw your signature first.",
                httpStatus: 400,
            });
            return;
        }

        setIsSaving(true);
        clearUploadError();
        setAlertMessage({ feMessage: "Uploading signature..." });

        try {
            // 1️⃣ Convert canvas → Blob → File
            const blob = await canvasToBlob();
            if (!blob) throw new Error("Failed to convert signature to image");

            const file = new File(
                [blob],
                `signature-${Date.now()}.png`,
                { type: "image/png" }
            );

            // 2️⃣ Upload to cloud via your existing hook
            const uploadResult = await upload(file);

            if (!uploadResult?.fileId) {
                throw new Error("Signature upload failed");
            }

            setAlertMessage({ feMessage: "Saving signature to your account..." });

            // 3️⃣ Save the returned assetId to the DB
            await saveSignature(selectedAccount, uploadResult.fileId);

            // 4️⃣ Update preview with the freshly uploaded URL
            setExistingSignatureUrl(uploadResult.url);

            setAlertMessage({
                feMessage: "Signature saved successfully!",
                httpStatus: 200,
            });

            // Clear the pad after successful save
            sigPadRef.current.clear();
            setHasDrawn(false);

            setTimeout(() => setAlertMessage({}), 3000);
        } catch (err: any) {
            setAlertMessage({
                feMessage: "Failed to save signature.",
                beMessage: err?.message,
                httpStatus: err?.status || 500,
            });
        } finally {
            setIsSaving(false);
        }
    };

    // ---------- Derived ----------
    const isBusy = isUploading || isSaving;

    const busyLabel = isUploading
        ? `Uploading... ${uploadProgress}%`
        : isSaving
            ? "Saving..."
            : "Save Signature";

    // ---------- Render ----------
    return (
        <Box
            sx={{
                width: "100%",
                px: { xs: 2, sm: 3, md: 4 },
                py: { xs: 2, sm: 4 },
            }}
        >
            {/* Header */}
            <Card
                elevation={0}
                sx={{
                    mb: 3,
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.default,
                    color: theme.palette.text.secondary,
                }}
            >
                <CardContent>
                    <Stack
                        direction={isMobile ? "column" : "row"}
                        spacing={2}
                        alignItems={isMobile ? "flex-start" : "center"}
                        justifyContent="space-between"
                    >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                                <DrawIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight={700}>
                                    My Signature
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    Draw your signature — it will appear on all your report cards
                                </Typography>
                            </Box>
                        </Stack>

                        {existingSignatureUrl && (
                            <Chip
                                icon={<CheckCircleIcon />}
                                label="Signature saved"
                                sx={{
                                    bgcolor: "rgba(255,255,255,0.2)",
                                    color: "inherit",
                                    fontWeight: 600,
                                }}
                            />
                        )}
                    </Stack>
                </CardContent>
            </Card>

            {/* Alerts */}
            <MessageDisplay
                feMessage={alertMessage.feMessage}
                beMessage={alertMessage.beMessage}
                httpStatus={alertMessage.httpStatus}
            />
            {uploadError && (
                <MessageDisplay
                    feMessage="Upload Error"
                    beMessage={uploadError}
                    httpStatus={500}
                />
            )}

            {/* Existing signature preview */}
            {existingSignatureUrl && (
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        mb: 3,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                        Current Signature
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            py: 2,
                            bgcolor: "#fafafa",
                            borderRadius: 1,
                        }}
                    >
                        <img
                            src={existingSignatureUrl}
                            alt="Current signature"
                            style={{
                                maxHeight: 120,
                                maxWidth: "100%",
                                objectFit: "contain",
                            }}
                        />
                    </Box>
                </Paper>
            )}

            {/* Drawing pad */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, sm: 3 },
                    mb: 3,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                }}
            >
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2 }}
                >
                    <Typography variant="subtitle2" fontWeight={700}>
                        Draw Your Signature
                    </Typography>

                    <Stack direction="row" spacing={1}>
                        <Tooltip title="Undo last stroke">
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={handleUndo}
                                    disabled={!hasDrawn || isBusy}
                                >
                                    <UndoIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Clear all">
                            <span>
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={handleClear}
                                    disabled={!hasDrawn || isBusy}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Stack>
                </Stack>

                <Box
                    sx={{
                        border: "2px dashed",
                        borderColor: hasDrawn ? "primary.main" : "divider",
                        borderRadius: 2,
                        backgroundColor: "#fff",
                        overflow: "hidden",
                        transition: "border-color 0.2s",
                        position: "relative",
                        touchAction: "none",
                    }}
                >
                    {isLoading ? (
                        <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            sx={{ height: 220 }}
                        >
                            <CircularProgress size={32} />
                        </Box>
                    ) : (
                        <SignatureCanvas
                            ref={sigPadRef}
                            penColor="#1a5276"
                            onEnd={handleEnd}
                            canvasProps={{
                                style: {
                                    width: "100%",
                                    height: isMobile ? 220 : 260,
                                    display: "block",
                                    cursor: "crosshair",
                                },
                            }}
                        />
                    )}

                    {/* Baseline hint */}
                    {!hasDrawn && !isLoading && (
                        <Box
                            sx={{
                                position: "absolute",
                                left: "10%",
                                right: "10%",
                                bottom: 60,
                                borderBottom: "1px dashed #ddd",
                                pointerEvents: "none",
                            }}
                        />
                    )}

                    {/* Hint text */}
                    {!hasDrawn && !isLoading && (
                        <Typography
                            variant="caption"
                            sx={{
                                position: "absolute",
                                left: "50%",
                                bottom: 30,
                                transform: "translateX(-50%)",
                                color: "text.secondary",
                                pointerEvents: "none",
                                opacity: 0.6,
                            }}
                        >
                            {isMobile
                                ? "Sign here with your finger"
                                : "Sign here with your mouse or stylus"}
                        </Typography>
                    )}

                    {/* Upload progress overlay */}
                    {isUploading && (
                        <Box
                            sx={{
                                position: "absolute",
                                inset: 0,
                                bgcolor: "rgba(255,255,255,0.85)",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 1.5,
                            }}
                        >
                            <CircularProgress variant="determinate" value={uploadProgress} />
                            <Typography variant="body2" fontWeight={600}>
                                Uploading... {uploadProgress}%
                            </Typography>
                        </Box>
                    )}
                </Box>

                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 1.5, textAlign: "center" }}
                >
                    By saving, you confirm this signature represents you on official
                    report cards issued by this school.
                </Typography>
            </Paper>

            {/* Action bar */}
            <Stack
                direction={isMobile ? "column" : "row"}
                spacing={2}
                justifyContent="flex-end"
            >
                <Button
                    variant="outlined"
                    onClick={handleClear}
                    disabled={!hasDrawn || isBusy}
                    startIcon={<DeleteIcon />}
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        fontWeight: 600,
                    }}
                >
                    Clear
                </Button>

                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={!hasDrawn || isBusy}
                    startIcon={
                        isBusy ? (
                            <CircularProgress size={18} color="inherit" />
                        ) : (
                            <SaveIcon />
                        )
                    }
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        fontWeight: 600,
                        minWidth: 200,
                    }}
                >
                    {busyLabel}
                </Button>
            </Stack>

            <Divider sx={{ my: 3 }} />

            {/* Tips */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "#f9fafb",
                }}
            >
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                    Tips for a clean signature
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2.5, color: "text.secondary" }}>
                    <li>
                        <Typography variant="caption">
                            Use your finger on mobile or a stylus on tablet for the best result
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="caption">
                            Sign inside the box — the signature is auto-cropped on save
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="caption">
                            You can re-draw and save anytime — new reports use the latest
                        </Typography>
                    </li>
                </Box>
            </Paper>
        </Box>
    );
};

export default MySignature;
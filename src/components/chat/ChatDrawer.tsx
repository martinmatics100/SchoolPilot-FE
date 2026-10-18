import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    TextField,
    Avatar,
    List,
    ListItemButton,
    ListItemAvatar,
    ListItemText,
    Badge,
    Divider,
    InputAdornment,
    CircularProgress,
    Button,
    alpha,
    useTheme,
} from "@mui/material";
import IconifyIcon from "../base/iconifyIcon";
import { useAuth } from "../../context";
import { useEnums } from "../../hooks/useEnums";
import {
    fetchMyChatRooms,
    fetchChatMessages,
    sendChatMessage,
    markChatRoomRead,
    startDirectChat,
    fetchChatRecipients,
    type ChatRoomSummary,
    type ChatMessage,
    type ChatRecipient,
} from "../../api/chatService";
import {
    getChatConnection,
    startChatConnection,
} from "../../api/signalRService";

const STORAGE_KEY_ACTIVE_ROOM = "chat.activeRoomId";

const initialsOf = (name: string) =>
    name
        .split(" ")
        .map((p) => p.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase();

const formatShortTime = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const dayMs = 86_400_000;

    if (diff < dayMs) {
        return d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
    }
    if (diff < 7 * dayMs) {
        return d.toLocaleDateString("en-NG", { weekday: "short" });
    }
    return d.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
};

const formatBubbleTime = (iso?: string | null) => {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString("en-NG", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

const isSameDay = (a?: string | null, b?: string | null) => {
    if (!a || !b) return false;
    const da = new Date(a);
    const db = new Date(b);
    return (
        da.getFullYear() === db.getFullYear() &&
        da.getMonth() === db.getMonth() &&
        da.getDate() === db.getDate()
    );
};

const formatDayLabel = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const dayMs = 86_400_000;
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMsg = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.round(
        (startOfToday.getTime() - startOfMsg.getTime()) / dayMs
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return d.toLocaleDateString("en-NG", { weekday: "long" });
    return d.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
};

interface ChatDrawerProps {
    open: boolean;
    onClose: () => void;
}

const ChatDrawer: React.FC<ChatDrawerProps> = ({ open, onClose }) => {
    const theme = useTheme();
    const { chatUserId } = useAuth();
    const { enums } = useEnums({ fetchPermissionData: false });

    const [rooms, setRooms] = useState<ChatRoomSummary[]>([]);
    const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [composerText, setComposerText] = useState("");
    const [searchRecipients, setSearchRecipients] = useState("");
    const [recipients, setRecipients] = useState<ChatRecipient[]>([]);
    const [showNewChat, setShowNewChat] = useState(false);
    const [loadingRecipients, setLoadingRecipients] = useState(false);
    const [startingRoomFor, setStartingRoomFor] = useState<string | null>(null);

    // SignalR connection state — kept in state so effects can react to it.
    const [hubState, setHubState] = useState<string>("Disconnected");

    const [typingUsers, setTypingUsers] = useState<
        Record<string, { userId: string; userName: string }>
    >({});

    const typingTimeoutRef = useRef<Record<string, number>>({});
    const isCurrentlyTypingRef = useRef<Record<string, boolean>>({});

    const scrollRef = useRef<HTMLDivElement>(null);

    const activeRoomIdRef = useRef<string | null>(null);
    const roomsRef = useRef<ChatRoomSummary[]>([]);

    useEffect(() => {
        activeRoomIdRef.current = activeRoomId;
    }, [activeRoomId]);

    useEffect(() => {
        roomsRef.current = rooms;
    }, [rooms]);

    useEffect(() => {
        try {
            if (activeRoomId) {
                localStorage.setItem(STORAGE_KEY_ACTIVE_ROOM, activeRoomId);
            } else {
                localStorage.removeItem(STORAGE_KEY_ACTIVE_ROOM);
            }
        } catch {
            /* ignore */
        }
    }, [activeRoomId]);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_ROOM);
            if (saved && !activeRoomId) {
                setActiveRoomId(saved);
            }
        } catch {
            /* ignore */
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const activeRoom = useMemo(
        () => rooms.find((r) => r.chatRoomId === activeRoomId) ?? null,
        [rooms, activeRoomId]
    );

    const isDark = theme.palette.mode === "dark";

    const senderBg = isDark ? "#1F6F3F" : "#2E7D32";
    const senderText = "#FFFFFF";
    const receiverBg = isDark ? "#4B5563" : "#6B7280";
    const receiverText = "#FFFFFF";

    const threadBg = isDark
        ? alpha(theme.palette.common.white, 0.02)
        : "#F7F7F8";

    const roleMap = useMemo(() => {
        return (
            enums?.UserRole?.reduce(
                (acc: Record<string, string>, r: any) => {
                    acc[String(r.value)] = r.displayName || r.name;
                    return acc;
                },
                {}
            ) || {}
        );
    }, [enums]);

    const roleLabelFor = (role?: string | null): string | null => {
        if (!role) return null;
        return roleMap[role] ?? role;
    };

    // Stable ref for loadRooms so SignalR handlers can call it without
    // re-subscribing when the callback identity changes.
    const loadRoomsRef = useRef<((preferRoomId?: string) => Promise<void>) | null>(
        null
    );

    const loadRooms = async (preferRoomId?: string) => {
        setLoadingRooms(true);
        try {
            const data = await fetchMyChatRooms();
            setRooms(data);

            const fromRef = activeRoomIdRef.current;
            const fromStorage = (() => {
                try {
                    return localStorage.getItem(STORAGE_KEY_ACTIVE_ROOM);
                } catch {
                    return null;
                }
            })();

            const candidates = [preferRoomId, fromRef, fromStorage];
            const targetRoomId =
                candidates.find(
                    (id) => id && data.some((r) => r.chatRoomId === id)
                ) ?? null;

            setActiveRoomId(targetRoomId);
        } catch (err) {
            console.error("Failed to load chat rooms", err);
            setRooms([]);
            setActiveRoomId(null);
        } finally {
            setLoadingRooms(false);
        }
    };

    // Keep the ref pointing at the latest closure on every render.
    useEffect(() => {
        loadRoomsRef.current = loadRooms;
    });

    /* ────────────────────────────────────────────────────────────
       SignalR: connect once per (open, chatUserId).
       Handlers read the current rooms/activeRoom via refs.
       Also tracks connection state so other effects can react.
       ──────────────────────────────────────────────────────────── */
    useEffect(() => {
        if (!open || !chatUserId) return;

        const conn = getChatConnection();

        const joinRooms = async (roomIds: string[]) => {
            if (roomIds.length === 0) return;
            try {
                await conn.invoke("JoinRooms", roomIds);
            } catch (err) {
                console.error("SignalR: could not join rooms", err);
            }
        };

        const bootstrap = async () => {
            try {
                await startChatConnection();
                setHubState(conn.state);
                // After start, join whatever rooms we currently have.
                await joinRooms(roomsRef.current.map((r) => r.chatRoomId));
            } catch (err) {
                console.error("SignalR: bootstrap failed", err);
                setHubState(conn.state);
            }
        };

        // ── New message handler ────────────────────────────────
        const onNewMessage = (payload: {
            roomId: string;
            id: string;
            senderUserId: string;
            senderName: string;
            body: string;
            createdOn: string;
            isDeleted: boolean;
        }) => {
            // If the room isn't in our list yet, refresh the room list
            // so the sender's new room appears immediately.
            const known = roomsRef.current.some(
                (r) => r.chatRoomId === payload.roomId
            );
            if (!known) {
                loadRoomsRef.current?.();
            }

            setMessages((prev) => {
                if (payload.roomId !== activeRoomIdRef.current) return prev;
                if (prev.some((m) => m.id === payload.id)) return prev;

                const optimisticIdx = prev.findIndex(
                    (m) =>
                        m.id.startsWith("local-") &&
                        m.senderUserId === payload.senderUserId &&
                        m.body === payload.body &&
                        !m.isDeleted
                );
                if (optimisticIdx !== -1) {
                    const next = [...prev];
                    next[optimisticIdx] = {
                        ...next[optimisticIdx],
                        id: payload.id,
                        senderName:
                            payload.senderName || next[optimisticIdx].senderName,
                        createdOn: payload.createdOn,
                        isDeleted: payload.isDeleted,
                    };
                    return next;
                }

                return [
                    ...prev,
                    {
                        id: payload.id,
                        senderUserId: payload.senderUserId,
                        senderName: payload.senderName,
                        body: payload.body,
                        isDeleted: payload.isDeleted,
                        createdOn: payload.createdOn,
                    },
                ];
            });

            setRooms((prev) =>
                prev.map((r) =>
                    r.chatRoomId === payload.roomId
                        ? {
                            ...r,
                            lastMessagePreview: payload.body,
                            lastMessageOn: payload.createdOn,
                            unreadCount:
                                payload.roomId === activeRoomIdRef.current
                                    ? 0
                                    : (r.unreadCount ?? 0) + 1,
                        }
                        : r
                )
            );
        };

        // ── New direct chat created (from the other user) ──────
        const onChatRoomCreated = (payload: {
            roomId: string;
            otherUserId: string;
            otherUserName: string;
            createdOn: string;
        }) => {
            setRooms((prev) => {
                if (prev.some((r) => r.chatRoomId === payload.roomId)) {
                    return prev;
                }
                const newRoom: ChatRoomSummary = {
                    chatRoomId: payload.roomId,
                    displayName: payload.otherUserName,
                    otherUserId: payload.otherUserId,
                    otherUserName: payload.otherUserName,
                    otherUserPhotoUrl: null,
                    lastMessagePreview: null,
                    lastMessageOn: payload.createdOn,
                    lastMessageSenderId: null,
                    unreadCount: 0,
                };
                return [newRoom, ...prev];
            });

            // Join the SignalR group for the new room right away so
            // the first message arrives even before the user opens it.
            const connNow = getChatConnection();
            if (connNow.state === "Connected") {
                connNow
                    .invoke("JoinRoom", payload.roomId)
                    .catch((err) =>
                        console.error("SignalR: could not join new room", err)
                    );
            }
        };

        const onUserTyping = (payload: {
            roomId: string;
            userId: string;
            userName: string;
        }) => {
            if (payload.userId === chatUserId) return;
            setTypingUsers((prev) => ({
                ...prev,
                [payload.roomId]: {
                    userId: payload.userId,
                    userName: payload.userName,
                },
            }));
        };

        const onUserStoppedTyping = (payload: {
            roomId: string;
            userId: string;
        }) => {
            setTypingUsers((prev) => {
                const next = { ...prev };
                if (next[payload.roomId]?.userId === payload.userId) {
                    delete next[payload.roomId];
                }
                return next;
            });
        };

        const onReconnected = async () => {
            setHubState(conn.state);
            try {
                await joinRooms(roomsRef.current.map((r) => r.chatRoomId));
                if (activeRoomIdRef.current) {
                    const { items } = await fetchChatMessages(
                        activeRoomIdRef.current,
                        1,
                        100
                    );
                    setMessages([...items].reverse());
                }
            } catch (err) {
                console.error("SignalR: post-reconnect sync failed", err);
            }
        };

        const onReconnecting = () => setHubState(conn.state);
        const onClosed = () => setHubState(conn.state);

        conn.on("NewMessage", onNewMessage);
        conn.on("ChatRoomCreated", onChatRoomCreated);
        conn.on("UserTyping", onUserTyping);
        conn.on("UserStoppedTyping", onUserStoppedTyping);
        conn.onreconnecting(onReconnecting);
        conn.onreconnected(onReconnected);
        conn.onclose(onClosed);

        bootstrap();

        return () => {
            conn.off("NewMessage", onNewMessage);
            conn.off("ChatRoomCreated", onChatRoomCreated);
            conn.off("UserTyping", onUserTyping);
            conn.off("UserStoppedTyping", onUserStoppedTyping);
            conn.off("reconnecting", onReconnecting);
            conn.off("reconnected", onReconnected);
            conn.off("close", onClosed);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, chatUserId]);

    /* Whenever the room list changes AND we're connected, make sure
       the hub is joined to every room. This is what actually fixes
       the "messages only appear on reload" symptom. */
    useEffect(() => {
        if (!open || !chatUserId) return;
        if (hubState !== "Connected") return;
        if (rooms.length === 0) return;

        const conn = getChatConnection();
        const roomIds = rooms.map((r) => r.chatRoomId);
        conn.invoke("JoinRooms", roomIds).catch((err) =>
            console.error("SignalR: could not refresh room joins", err)
        );
    }, [open, chatUserId, hubState, rooms]);

    /* Join the active room on the hub when it changes. */
    useEffect(() => {
        if (!open || !activeRoomId) return;
        if (hubState !== "Connected") return;
        const conn = getChatConnection();
        conn.invoke("JoinRoom", activeRoomId).catch((err) =>
            console.error("SignalR: could not join room", err)
        );
    }, [activeRoomId, open, hubState]);

    useEffect(() => {
        if (!open) return;
        loadRooms();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => {
        if (!activeRoomId || !open) {
            setMessages([]);
            return;
        }

        let cancelled = false;

        const load = async () => {
            setLoadingMessages(true);
            try {
                const { items } = await fetchChatMessages(activeRoomId, 1, 100);
                if (cancelled) return;

                setMessages([...items].reverse());

                await markChatRoomRead(activeRoomId);
                if (cancelled) return;

                setRooms((prev) =>
                    prev.map((r) =>
                        r.chatRoomId === activeRoomId
                            ? { ...r, unreadCount: 0 }
                            : r
                    )
                );
            } catch (err) {
                if (!cancelled) {
                    console.error("Failed to load messages", err);
                    setMessages([]);
                }
            } finally {
                if (!cancelled) setLoadingMessages(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [activeRoomId, open]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (!showNewChat) return;

        let cancelled = false;

        const load = async () => {
            setLoadingRecipients(true);
            try {
                const data = await fetchChatRecipients(searchRecipients);
                if (!cancelled) setRecipients(data);
            } catch (err) {
                if (!cancelled) {
                    console.error("Failed to load recipients", err);
                    setRecipients([]);
                }
            } finally {
                if (!cancelled) setLoadingRecipients(false);
            }
        };

        const t = setTimeout(load, 250);
        return () => {
            cancelled = true;
            clearTimeout(t);
        };
    }, [showNewChat, searchRecipients]);

    useEffect(() => {
        return () => {
            Object.values(typingTimeoutRef.current).forEach((id) =>
                window.clearTimeout(id)
            );
            typingTimeoutRef.current = {};
            isCurrentlyTypingRef.current = {};

            setTypingUsers({});
        };
    }, [activeRoomId]);

    const handleSend = async () => {
        const body = composerText.trim();
        if (!body || !activeRoomId || sending) return;

        setSending(true);

        const localId = `local-${Date.now()}`;
        const optimistic: ChatMessage = {
            id: localId,
            senderUserId: chatUserId ?? "me",
            senderName: "You",
            body,
            isDeleted: false,
            createdOn: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, optimistic]);
        setRooms((prev) =>
            prev.map((r) =>
                r.chatRoomId === activeRoomId
                    ? {
                        ...r,
                        lastMessagePreview: body,
                        lastMessageOn: optimistic.createdOn ?? null,
                    }
                    : r
            )
        );
        setComposerText("");

        const conn = getChatConnection();
        if (conn.state === "Connected") {
            conn.invoke("StopTyping", activeRoomId).catch(() => { });
            isCurrentlyTypingRef.current[activeRoomId] = false;
            const existing = typingTimeoutRef.current[activeRoomId];
            if (existing) window.clearTimeout(existing);
        }

        try {
            const { messageId, sentOn } = await sendChatMessage(activeRoomId, body);
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === localId
                        ? { ...m, id: messageId, createdOn: sentOn }
                        : m
                )
            );
        } catch (err) {
            console.error("Failed to send message", err);
            setMessages((prev) => prev.filter((m) => m.id !== localId));
        } finally {
            setSending(false);
        }
    };

    const handlePickRecipient = async (recipient: ChatRecipient) => {
        setStartingRoomFor(recipient.userId);
        try {
            const { chatRoomId } = await startDirectChat(recipient.userId);
            await loadRooms(chatRoomId);
            setShowNewChat(false);
            setSearchRecipients("");
        } catch (err) {
            console.error("Failed to start chat", err);
        } finally {
            setStartingRoomFor(null);
        }
    };

    const onComposerChange = (value: string) => {
        setComposerText(value);

        if (!activeRoomId) return;

        const conn = getChatConnection();
        if (conn.state !== "Connected") return;

        if (!isCurrentlyTypingRef.current[activeRoomId]) {
            isCurrentlyTypingRef.current[activeRoomId] = true;
            conn.invoke("Typing", activeRoomId).catch(() => { });
        }

        const existing = typingTimeoutRef.current[activeRoomId];
        if (existing) window.clearTimeout(existing);

        typingTimeoutRef.current[activeRoomId] = window.setTimeout(() => {
            isCurrentlyTypingRef.current[activeRoomId] = false;
            conn.invoke("StopTyping", activeRoomId).catch(() => { });
        }, 2000);
    };

    const myId = chatUserId ?? "me";
    const activeTypingUser = activeRoom
        ? typingUsers[activeRoom.chatRoomId]
        : undefined;

    const renderedMessages = useMemo(() => {
        type Row =
            | { kind: "day"; key: string; label: string }
            | {
                kind: "msg";
                key: string;
                message: ChatMessage;
                isMe: boolean;
                isFirstInRun: boolean;
                isLastInRun: boolean;
            };

        const rows: Row[] = [];
        for (let idx = 0; idx < messages.length; idx++) {
            const m = messages[idx];
            const prev = messages[idx - 1];
            const next = messages[idx + 1];

            const showDaySeparator =
                !prev || !isSameDay(prev.createdOn, m.createdOn);

            if (showDaySeparator) {
                rows.push({
                    kind: "day",
                    key: `day-${m.id}`,
                    label: formatDayLabel(m.createdOn),
                });
            }

            const isFirstInRun =
                !prev ||
                prev.senderUserId !== m.senderUserId ||
                !isSameDay(prev.createdOn, m.createdOn);

            const isLastInRun =
                !next ||
                next.senderUserId !== m.senderUserId ||
                !isSameDay(next.createdOn, m.createdOn);

            rows.push({
                kind: "msg",
                key: `msg-${m.id}`,
                message: m,
                isMe: m.senderUserId === myId,
                isFirstInRun,
                isLastInRun,
            });
        }
        return rows;
    }, [messages, myId]);

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: "100%", sm: 720, md: 900 },
                    maxWidth: "100vw",
                    bgcolor: theme.palette.background.default,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                },
            }}
        >
            {/* ── Header ── */}
            <Box
                sx={{
                    px: { xs: 1.5, sm: 2 },
                    py: 1.5,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    background: `linear-gradient(90deg, ${alpha(
                        theme.palette.primary.main,
                        0.06
                    )} 0%, ${alpha(theme.palette.secondary.main, 0.06)} 100%)`,
                }}
            >
                <Box
                    sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                        color: theme.palette.primary.main,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <IconifyIcon icon="mdi:message-text" width={20} />
                </Box>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        flex: 1,
                        fontSize: { xs: "1rem", sm: "1.15rem" },
                    }}
                >
                    Chats
                </Typography>
                <Button
                    size="small"
                    variant="contained"
                    startIcon={<IconifyIcon icon="mdi:plus" width={16} />}
                    onClick={() => setShowNewChat(true)}
                    sx={{
                        textTransform: "none",
                        borderRadius: 99,
                        px: { xs: 1.25, sm: 2 },
                        fontWeight: 700,
                        boxShadow: "none",
                        "& .MuiButton-startIcon": { mr: { xs: 0, sm: 0.5 } },
                        minWidth: { xs: 40, sm: "auto" },
                    }}
                >
                    <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                        New
                    </Box>
                </Button>
                <IconButton onClick={onClose} size="small">
                    <IconifyIcon icon="ic:round-close" width={22} />
                </IconButton>
            </Box>

            {/* ── Body ── */}
            <Box sx={{ flex: 1, display: "flex", minHeight: 0 }}>
                {/* Left: room list */}
                <Box
                    sx={{
                        width: { xs: 84, sm: 280 },
                        flexShrink: 0,
                        borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        display: "flex",
                        flexDirection: "column",
                        bgcolor: alpha(theme.palette.background.default, 0.6),
                    }}
                >
                    <Box sx={{ flex: 1, overflowY: "auto" }}>
                        {loadingRooms ? (
                            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : rooms.length === 0 ? (
                            <Box
                                sx={{
                                    p: 2,
                                    textAlign: "center",
                                    color: "text.secondary",
                                    display: { xs: "none", sm: "block" },
                                }}
                            >
                                <IconifyIcon icon="mdi:message-outline" width={32} />
                                <Typography
                                    variant="caption"
                                    sx={{ display: "block", mt: 1 }}
                                >
                                    No conversations yet.
                                </Typography>
                            </Box>
                        ) : (
                            <List disablePadding>
                                {rooms.map((room) => {
                                    const active = room.chatRoomId === activeRoomId;
                                    return (
                                        <ListItemButton
                                            key={room.chatRoomId}
                                            selected={active}
                                            onClick={() => setActiveRoomId(room.chatRoomId)}
                                            sx={{
                                                py: { xs: 1, sm: 1.25 },
                                                px: { xs: 1, sm: 2 },
                                                borderRadius: 0,
                                                position: "relative",
                                                "&::before": {
                                                    content: '""',
                                                    position: "absolute",
                                                    left: 0,
                                                    top: 8,
                                                    bottom: 8,
                                                    width: 3,
                                                    borderRadius: 2,
                                                    bgcolor: active
                                                        ? theme.palette.primary.main
                                                        : "transparent",
                                                },
                                                "&.Mui-selected": {
                                                    bgcolor: alpha(
                                                        theme.palette.primary.main,
                                                        0.08
                                                    ),
                                                    "&:hover": {
                                                        bgcolor: alpha(
                                                            theme.palette.primary.main,
                                                            0.12
                                                        ),
                                                    },
                                                },
                                            }}
                                        >
                                            <ListItemAvatar
                                                sx={{
                                                    minWidth: { xs: 0, sm: 52 },
                                                    mr: { xs: 0, sm: 1.5 },
                                                    display: "flex",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <Badge
                                                    color="success"
                                                    badgeContent={room.unreadCount || undefined}
                                                    overlap="circular"
                                                    anchorOrigin={{
                                                        vertical: "top",
                                                        horizontal: "right",
                                                    }}
                                                    sx={{
                                                        "& .MuiBadge-badge": {
                                                            fontSize: "0.65rem",
                                                            height: 18,
                                                            minWidth: 18,
                                                            border: `2px solid ${theme.palette.background.default}`,
                                                        },
                                                    }}
                                                >
                                                    <Avatar
                                                        sx={{
                                                            width: { xs: 40, sm: 42 },
                                                            height: { xs: 40, sm: 42 },
                                                            bgcolor: alpha(
                                                                theme.palette.primary.main,
                                                                0.15
                                                            ),
                                                            color: theme.palette.primary.main,
                                                            fontWeight: 700,
                                                            fontSize: "0.85rem",
                                                        }}
                                                    >
                                                        {initialsOf(room.displayName)}
                                                    </Avatar>
                                                </Badge>
                                            </ListItemAvatar>
                                            <ListItemText
                                                sx={{
                                                    display: { xs: "none", sm: "block" },
                                                    my: 0,
                                                }}
                                                primary={
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 700,
                                                            color: "text.primary",
                                                            fontSize: "0.875rem",
                                                        }}
                                                        noWrap
                                                    >
                                                        {room.displayName}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <>
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                            component="span"
                                                            noWrap
                                                            sx={{
                                                                display: "block",
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                whiteSpace: "nowrap",
                                                                fontSize: "0.75rem",
                                                            }}
                                                        >
                                                            {room.lastMessagePreview || "No messages yet"}
                                                        </Typography>
                                                        <Typography
                                                            variant="caption"
                                                            color="text.disabled"
                                                            component="span"
                                                            sx={{
                                                                fontSize: "0.68rem",
                                                                display: "block",
                                                                mt: 0.25,
                                                            }}
                                                        >
                                                            {formatShortTime(room.lastMessageOn)}
                                                        </Typography>
                                                    </>
                                                }
                                            />
                                        </ListItemButton>
                                    );
                                })}
                            </List>
                        )}
                    </Box>
                </Box>

                {/* Right: thread */}
                <Box
                    sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        minWidth: 0,
                        bgcolor: threadBg,
                    }}
                >
                    {activeRoom ? (
                        <>
                            {/* Thread header */}
                            <Box
                                sx={{
                                    px: { xs: 1.5, sm: 2 },
                                    py: 1.25,
                                    borderBottom: `1px solid ${alpha(
                                        theme.palette.divider,
                                        0.1
                                    )}`,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    bgcolor: theme.palette.background.default,
                                }}
                            >
                                <Avatar
                                    sx={{
                                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                                        color: theme.palette.primary.main,
                                        fontWeight: 700,
                                        width: { xs: 34, sm: 38 },
                                        height: { xs: 34, sm: 38 },
                                        fontSize: "0.85rem",
                                    }}
                                >
                                    {initialsOf(activeRoom.displayName)}
                                </Avatar>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            fontWeight: 700,
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        {activeRoom.displayName}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: activeTypingUser
                                                ? theme.palette.primary.main
                                                : theme.palette.success.main,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {activeTypingUser
                                            ? `${activeTypingUser.userName} is typing…`
                                            : "● Direct message"}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Messages */}
                            <Box
                                ref={scrollRef}
                                sx={{
                                    flex: 1,
                                    overflowY: "auto",
                                    px: { xs: 1.5, sm: 2.5 },
                                    py: { xs: 1.5, sm: 2 },
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 0.5,
                                }}
                            >
                                {loadingMessages ? (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            py: 4,
                                        }}
                                    >
                                        <CircularProgress size={24} />
                                    </Box>
                                ) : renderedMessages.length === 0 ? (
                                    <Box
                                        sx={{
                                            textAlign: "center",
                                            py: 6,
                                            color: "text.secondary",
                                            flex: 1,
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 64,
                                                height: 64,
                                                borderRadius: "50%",
                                                bgcolor: alpha(
                                                    theme.palette.primary.main,
                                                    0.08
                                                ),
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                mb: 1.5,
                                            }}
                                        >
                                            <IconifyIcon
                                                icon="mdi:hand-wave"
                                                width={32}
                                                color={theme.palette.primary.main}
                                            />
                                        </Box>
                                        <Typography variant="body2">
                                            No messages yet. Say hello!
                                        </Typography>
                                    </Box>
                                ) : (
                                    renderedMessages.map((row) => {
                                        if (row.kind === "day") {
                                            return (
                                                <Box
                                                    key={row.key}
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        my: 1.5,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            px: 1.5,
                                                            py: 0.4,
                                                            borderRadius: 99,
                                                            bgcolor: alpha(
                                                                theme.palette.text.primary,
                                                                0.06
                                                            ),
                                                            fontSize: "0.7rem",
                                                            fontWeight: 600,
                                                            color:
                                                                theme.palette.text.secondary,
                                                        }}
                                                    >
                                                        {row.label}
                                                    </Box>
                                                </Box>
                                            );
                                        }

                                        const {
                                            message: m,
                                            isMe,
                                            isFirstInRun,
                                            isLastInRun,
                                        } = row;

                                        const bubbleRadius = isMe
                                            ? `16px 16px 16px ${isLastInRun ? "4px" : "16px"
                                            }`
                                            : `16px 16px ${isLastInRun ? "4px" : "16px"
                                            } 16px`;

                                        const bubbleBg = isMe ? senderBg : receiverBg;
                                        const bubbleFg = isMe ? senderText : receiverText;

                                        return (
                                            <Box
                                                key={row.key}
                                                sx={{
                                                    alignSelf: isMe
                                                        ? "flex-start"
                                                        : "flex-end",
                                                    maxWidth: {
                                                        xs: "82%",
                                                        sm: "70%",
                                                    },
                                                    mt: isFirstInRun ? 0.75 : 0.15,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        px: 1.5,
                                                        py: 0.9,
                                                        borderRadius: bubbleRadius,
                                                        bgcolor: bubbleBg,
                                                        color: bubbleFg,
                                                        boxShadow: `0 1px 2px ${alpha(
                                                            "#000",
                                                            0.12
                                                        )}`,
                                                        position: "relative",
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            whiteSpace: "pre-wrap",
                                                            wordBreak: "break-word",
                                                            lineHeight: 1.45,
                                                            fontSize: {
                                                                xs: "0.875rem",
                                                                sm: "0.9rem",
                                                            },
                                                            color: "inherit",
                                                        }}
                                                    >
                                                        {m.isDeleted ? (
                                                            <em
                                                                style={{
                                                                    opacity: 0.7,
                                                                }}
                                                            >
                                                                Message removed
                                                            </em>
                                                        ) : (
                                                            m.body
                                                        )}
                                                    </Typography>
                                                    <Typography
                                                        component="span"
                                                        sx={{
                                                            display: "block",
                                                            textAlign: "right",
                                                            fontSize: "0.65rem",
                                                            mt: 0.35,
                                                            opacity: 0.85,
                                                            color: "inherit",
                                                        }}
                                                    >
                                                        {formatBubbleTime(m.createdOn)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        );
                                    })
                                )}
                            </Box>

                            {/* Typing indicator row */}
                            {activeTypingUser && (
                                <Box
                                    sx={{
                                        px: { xs: 1.5, sm: 2.5 },
                                        pb: 0.5,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.75,
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: theme.palette.text.secondary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        {activeTypingUser.userName} is typing
                                    </Typography>
                                    <Box sx={{ display: "flex", gap: 0.4 }}>
                                        {[0, 1, 2].map((i) => (
                                            <Box
                                                key={`typing-dot-${i}`}
                                                sx={{
                                                    width: 5,
                                                    height: 5,
                                                    borderRadius: "50%",
                                                    bgcolor: theme.palette.text.secondary,
                                                    animation:
                                                        "typing-bounce 1.2s infinite ease-in-out",
                                                    animationDelay: `${i * 0.15}s`,
                                                    "@keyframes typing-bounce": {
                                                        "0%, 60%, 100%": {
                                                            transform: "translateY(0)",
                                                            opacity: 0.4,
                                                        },
                                                        "30%": {
                                                            transform: "translateY(-4px)",
                                                            opacity: 1,
                                                        },
                                                    },
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {/* Composer */}
                            <Box
                                sx={{
                                    px: { xs: 1.5, sm: 2 },
                                    py: 1.25,
                                    borderTop: `1px solid ${alpha(
                                        theme.palette.divider,
                                        0.1
                                    )}`,
                                    display: "flex",
                                    gap: 1,
                                    alignItems: "flex-end",
                                    bgcolor: theme.palette.background.default,
                                }}
                            >
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Type a message…"
                                    value={composerText}
                                    onChange={(e) => onComposerChange(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    multiline
                                    maxRows={5}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "22px",
                                            bgcolor: alpha(
                                                theme.palette.background.paper,
                                                0.5
                                            ),
                                            pr: 0.5,
                                        },
                                    }}
                                />
                                <IconButton
                                    onClick={handleSend}
                                    disabled={sending || !composerText.trim()}
                                    sx={{
                                        bgcolor: theme.palette.primary.main,
                                        color: theme.palette.common.white,
                                        width: 42,
                                        height: 42,
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                            bgcolor: theme.palette.primary.dark,
                                            transform: "scale(1.05)",
                                        },
                                        "&.Mui-disabled": {
                                            bgcolor: alpha(
                                                theme.palette.action.disabled,
                                                0.3
                                            ),
                                            color: "inherit",
                                        },
                                    }}
                                >
                                    {sending ? (
                                        <CircularProgress
                                            size={18}
                                            color="inherit"
                                        />
                                    ) : (
                                        <IconifyIcon icon="mdi:send" width={20} />
                                    )}
                                </IconButton>
                            </Box>
                        </>
                    ) : (
                        <Box
                            sx={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: 1,
                                color: "text.secondary",
                                p: 3,
                                textAlign: "center",
                            }}
                        >
                            <Box
                                sx={{
                                    width: 72,
                                    height: 72,
                                    borderRadius: "50%",
                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    mb: 1,
                                }}
                            >
                                <IconifyIcon
                                    icon="mdi:message-text-outline"
                                    width={36}
                                    color={theme.palette.primary.main}
                                />
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {rooms.length > 0
                                    ? "Select a conversation"
                                    : "No conversations yet"}
                            </Typography>
                            <Typography variant="caption" sx={{ maxWidth: 260 }}>
                                {rooms.length > 0
                                    ? "Pick a room on the left to start messaging."
                                    : 'Tap "New" to start your first chat.'}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* ── New chat overlay ── */}
            {showNewChat && (
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        bgcolor: alpha("#000", 0.4),
                        display: "flex",
                        justifyContent: "center",
                        alignItems: { xs: "stretch", sm: "center" },
                        p: { xs: 0, sm: 3 },
                        zIndex: 5,
                        backdropFilter: "blur(2px)",
                    }}
                    onClick={() => setShowNewChat(false)}
                >
                    <Box
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                            bgcolor: theme.palette.background.default,
                            width: { xs: "100%", sm: 460 },
                            maxHeight: { xs: "100%", sm: "75vh" },
                            borderRadius: { xs: 0, sm: 3 },
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                            boxShadow: theme.shadows[24],
                        }}
                    >
                        <Box
                            sx={{
                                p: 2,
                                display: "flex",
                                alignItems: "center",
                                borderBottom: `1px solid ${alpha(
                                    theme.palette.divider,
                                    0.1
                                )}`,
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 700, flex: 1, fontSize: "1.05rem" }}
                            >
                                New chat
                            </Typography>
                            <IconButton
                                onClick={() => setShowNewChat(false)}
                                size="small"
                            >
                                <IconifyIcon icon="ic:round-close" width={20} />
                            </IconButton>
                        </Box>

                        <Box sx={{ p: 2 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search by name or email"
                                value={searchRecipients}
                                onChange={(e) => setSearchRecipients(e.target.value)}
                                autoFocus
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <IconifyIcon
                                                icon="mdi:magnify"
                                                width={18}
                                            />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: 99,
                                    },
                                }}
                            />
                        </Box>

                        <Divider />

                        <Box sx={{ flex: 1, overflowY: "auto" }}>
                            {loadingRecipients ? (
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        py: 4,
                                    }}
                                >
                                    <CircularProgress size={24} />
                                </Box>
                            ) : recipients.length === 0 ? (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ p: 3, textAlign: "center" }}
                                >
                                    {searchRecipients.trim()
                                        ? "No users match your search."
                                        : "No users available to chat with."}
                                </Typography>
                            ) : (
                                <List disablePadding>
                                    {recipients.map((r) => {
                                        const roleLabel = roleLabelFor(r.role);
                                        const busy = startingRoomFor === r.userId;
                                        return (
                                            <ListItemButton
                                                key={r.userId}
                                                disabled={busy}
                                                onClick={() => handlePickRecipient(r)}
                                                sx={{
                                                    py: 1.25,
                                                    "&:hover": {
                                                        bgcolor: alpha(
                                                            theme.palette.primary.main,
                                                            0.06
                                                        ),
                                                    },
                                                }}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar
                                                        sx={{
                                                            bgcolor: alpha(
                                                                theme.palette.primary.main,
                                                                0.15
                                                            ),
                                                            color: theme.palette.primary.main,
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        {initialsOf(r.name)}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Typography
                                                            variant="body2"
                                                            sx={{ fontWeight: 700 }}
                                                        >
                                                            {r.name}
                                                        </Typography>
                                                    }
                                                    secondary={roleLabel ?? r.email}
                                                />
                                                {busy && (
                                                    <CircularProgress size={18} />
                                                )}
                                            </ListItemButton>
                                        );
                                    })}
                                </List>
                            )}
                        </Box>
                    </Box>
                </Box>
            )}
        </Drawer>
    );
};

export default ChatDrawer;
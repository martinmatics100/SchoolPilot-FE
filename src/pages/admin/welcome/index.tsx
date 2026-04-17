import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Card, CardContent, Grid, CircularProgress, alpha, Divider, Stack, Chip, useMediaQuery } from '@mui/material';
import Image from '../../../components/base/image';
import { useTheme } from "@mui/material";
import { useEnums } from '../../../hooks/useEnums';
import image from "../../../assets/palmfitLogoWithText.png";
import { SchoolService } from '../../../api/schoolService';
import { type SchoolDetails } from '../../../types/interfaces/i-school';
import IconifyIcon from '../../../components/base/iconifyIcon';

const Index = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const { enums, isLoading: isEnumsLoading } = useEnums({ fetchPermissionData: false });
    const [schoolData, setSchoolData] = useState<SchoolDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const currentTime = new Date().getHours();
    const greeting = currentTime < 12 ? 'Good Morning' : currentTime < 18 ? 'Good Afternoon' : 'Good Evening';

    // Map enums for SchoolSessions and SchoolTerms
    const sessionMap = useMemo(() => {
        return enums?.SchoolSessions?.reduce(
            (acc: Record<string, string>, item: { value: number; displayName: string; name: string }) => {
                acc[item.value] = item.displayName || item.name;
                return acc;
            },
            {}
        ) || {};
    }, [enums]);

    const termMap = useMemo(() => {
        return enums?.SchoolTerms?.reduce(
            (acc: Record<string, string>, item: { value: number; displayName: string; name: string }) => {
                acc[item.value] = item.displayName || item.name;
                return acc;
            },
            {}
        ) || {};
    }, [enums]);

    // Fetch school details using the service
    useEffect(() => {
        fetchSchoolDetails();
    }, []);

    const fetchSchoolDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await SchoolService.getSchoolDetails();
            setSchoolData(data);
        } catch (err) {
            console.error('Error in component:', err);
            setError('Failed to load school details');
            setSchoolData(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading || isEnumsLoading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="400px"
                sx={{
                    bgcolor: 'background.default',
                }}
            >
                <CircularProgress
                    size={48}
                    sx={{
                        color: 'primary.main',
                    }}
                />
            </Box>
        );
    }

    if (error) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="400px"
                sx={{
                    bgcolor: 'background.default',
                }}
            >
                <Card
                    sx={{
                        p: 3,
                        textAlign: 'center',
                        maxWidth: 400,
                        bgcolor: 'background.paper',
                        borderRadius: 3,
                    }}
                >
                    <IconifyIcon icon="mdi:alert-circle-outline" width={48} color={theme.palette.error.main} />
                    <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>
                </Card>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100%',
                bgcolor: 'background.default',
                py: { xs: 3, sm: 4, md: 5 },
                px: { xs: 2, sm: 3, md: 4 },
            }}
        >
            <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
                {/* Welcome Header */}
                <Box sx={{ mb: { xs: 4, sm: 5, md: 6 } }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: 'text.primary',
                            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                            mb: 0.5,
                            letterSpacing: '-0.02em',
                        }}
                    >
                        {greeting},
                    </Typography>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 500,
                            color: 'text.secondary',
                            fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
                        }}
                    >
                        Welcome to your Dashboard
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {/* Main School Info Card */}
                    <Grid item xs={12} md={7}>
                        <Card
                            sx={{
                                p: { xs: 3, sm: 4, md: 5 },
                                borderRadius: 4,
                                bgcolor: 'background.default',
                                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.08)}`,
                                    transform: 'translateY(-4px)',
                                },
                                height: '100%',
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', md: 'row' },
                                    alignItems: { xs: 'center', md: 'flex-start' },
                                    gap: { xs: 3, md: 4 },
                                }}
                            >
                                {/* Logo */}
                                <Box
                                    sx={{
                                        flexShrink: 0,
                                        p: 2.5,
                                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                                        borderRadius: 4,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Image
                                        src={image}
                                        alt={`${schoolData?.schoolName || 'School'} Logo`}
                                        sx={{
                                            width: { xs: '100px', sm: '120px', md: '140px' },
                                            height: 'auto',
                                            objectFit: 'contain',
                                        }}
                                    />
                                </Box>

                                {/* School Details */}
                                <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                                    <Typography
                                        variant="h3"
                                        sx={{
                                            fontWeight: 700,
                                            color: 'text.primary',
                                            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                                            mb: 1.5,
                                            letterSpacing: '-0.02em',
                                        }}
                                    >
                                        {schoolData?.schoolName || 'School Name'}
                                    </Typography>

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 1,
                                            justifyContent: { xs: 'center', md: 'flex-start' },
                                            mb: 2.5,
                                        }}
                                    >
                                        <Chip
                                            label="Active Institution"
                                            size="small"
                                            sx={{
                                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                                color: theme.palette.success.main,
                                                fontWeight: 500,
                                                fontSize: '0.75rem',
                                                borderRadius: 2,
                                            }}
                                        />
                                        <Chip
                                            label="Verified"
                                            size="small"
                                            sx={{
                                                bgcolor: alpha(theme.palette.info.main, 0.1),
                                                color: theme.palette.info.main,
                                                fontWeight: 500,
                                                fontSize: '0.75rem',
                                                borderRadius: 2,
                                            }}
                                        />
                                    </Box>

                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: 'text.secondary',
                                            fontSize: { xs: '0.875rem', sm: '0.95rem' },
                                            lineHeight: 1.7,
                                        }}
                                    >
                                        Welcome aboard! We're excited to have you here. Manage your academic activities, track progress, and achieve excellence.
                                    </Typography>
                                </Box>
                            </Box>
                        </Card>
                    </Grid>

                    {/* Academic Info Card */}
                    <Grid item xs={12} md={5}>
                        <Card
                            sx={{
                                p: { xs: 3, sm: 4, md: 5 },
                                borderRadius: 4,
                                bgcolor: 'background.default',
                                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.08)}`,
                                    transform: 'translateY(-4px)',
                                },
                                height: '100%',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Box
                                    sx={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 2.5,
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mr: 1.5,
                                    }}
                                >
                                    <IconifyIcon
                                        icon="mdi:academic-cap-outline"
                                        width={26}
                                        color={theme.palette.primary.main}
                                    />
                                </Box>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        color: 'text.primary',
                                        fontSize: { xs: '1.1rem', sm: '1.2rem' },
                                    }}
                                >
                                    Academic Information
                                </Typography>
                            </Box>

                            <Divider sx={{ mb: 3 }} />

                            {/* Session Info */}
                            <Box sx={{ mb: 3 }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: 'text.secondary',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                        display: 'block',
                                        mb: 1.5,
                                    }}
                                >
                                    Current Session
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        p: 1.75,
                                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                                        borderRadius: 2.5,
                                    }}
                                >
                                    <IconifyIcon
                                        icon="mdi:calendar-outline"
                                        width={22}
                                        color={theme.palette.primary.main}
                                        style={{ marginRight: '12px' }}
                                    />
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontWeight: 500,
                                            color: 'text.primary',
                                            fontSize: { xs: '0.9rem', sm: '0.95rem' },
                                        }}
                                    >
                                        {schoolData?.currentSession ? sessionMap[schoolData.currentSession.toString()] : 'Not Set Yet'}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Term Info */}
                            <Box>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: 'text.secondary',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                        display: 'block',
                                        mb: 1.5,
                                    }}
                                >
                                    Active Term
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        p: 1.75,
                                        bgcolor: alpha(theme.palette.secondary.main, 0.04),
                                        borderRadius: 2.5,
                                    }}
                                >
                                    <IconifyIcon
                                        icon="mdi:flag-outline"
                                        width={22}
                                        color={theme.palette.secondary.main}
                                        style={{ marginRight: '12px' }}
                                    />
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontWeight: 500,
                                            color: 'text.primary',
                                            fontSize: { xs: '0.9rem', sm: '0.95rem' },
                                        }}
                                    >
                                        {schoolData?.currentTerm ? termMap[schoolData.currentTerm.toString()] : 'Not Set Yet'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
                {/* Motto/Quote Footer */}
                <Box
                    sx={{
                        mt: 4,
                        p: 3,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                        textAlign: 'center',
                        borderTop: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    }}
                >
                    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" flexWrap="wrap">
                        <IconifyIcon icon="mdi:quote-open" width={18} color={theme.palette.primary.main} />
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                            Excellence in education is not a destination, but a continuous journey
                        </Typography>
                        <IconifyIcon icon="mdi:quote-close" width={18} color={theme.palette.primary.main} />
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
};

export default Index;
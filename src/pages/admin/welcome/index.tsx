import React, { useEffect, useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Card,
    CircularProgress,
    alpha,
    Divider,
    Stack,
    Chip,
} from '@mui/material';
import { useTheme } from '@mui/material';
import { useEnums } from '../../../hooks/useEnums';
import { SchoolService } from '../../../api/schoolService';
import { type SchoolDetails } from '../../../types/interfaces/i-school';
import IconifyIcon from '../../../components/base/iconifyIcon';


const SchoolDashboard: React.FC = () => {

    const theme = useTheme();

    const { enums, isLoading: isEnumsLoading } = useEnums({
        fetchPermissionData: false,
    });


    const [schoolData, setSchoolData] = useState<SchoolDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);


    const sessionMap = useMemo(() => {
        return (
            enums?.SchoolSessions?.reduce(
                (
                    acc: Record<string, string>,
                    item: { value: number; displayName: string; name: string }
                ) => {
                    acc[item.value] = item.displayName || item.name;
                    return acc;
                },
                {}
            ) || {}
        );
    }, [enums]);

    const termMap = useMemo(() => {
        return (
            enums?.SchoolTerms?.reduce(
                (
                    acc: Record<string, string>,
                    item: { value: number; displayName: string; name: string }
                ) => {
                    acc[item.value] = item.displayName || item.name;
                    return acc;
                },
                {}
            ) || {}
        );
    }, [enums]);

    const fetchSchoolDetails = async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const data = await SchoolService.getSchoolDetails();
            setSchoolData(data);
        } catch (err) {
            console.error('Error fetching school details:', err);
            setError('Failed to load school details. Please try again.');
            setSchoolData(null);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchSchoolDetails();
    }, []);

    const getCurrentSessionLabel = (): string => {
        if (!schoolData?.currentSession) return 'Not Set Yet';
        return sessionMap[schoolData.currentSession.toString()] || 'Not Set Yet';
    };

    const getCurrentTermLabel = (): string => {
        if (!schoolData?.currentTerm) return 'Not Set Yet';
        return termMap[schoolData.currentTerm.toString()] || 'Not Set Yet';
    };

    const renderLoading = () => (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
            sx={{ bgcolor: 'background.default' }}
        >
            <CircularProgress size={48} sx={{ color: 'primary.main' }} />
        </Box>
    );

    const renderError = () => (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
            sx={{ bgcolor: 'background.default' }}
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
                <IconifyIcon
                    icon="mdi:alert-circle-outline"
                    width={48}
                    color={theme.palette.error.main}
                />
                <Typography color="error" sx={{ mt: 2 }}>
                    {error}
                </Typography>
            </Card>
        </Box>
    );

    const renderLogoPlaceholder = () => (
        <Box
            sx={{
                flexShrink: 0,
                width: { xs: '120px', sm: '140px', md: '160px' },
                height: { xs: '120px', sm: '140px', md: '160px' },
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                borderRadius: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                p: 2,
            }}
        >
            <IconifyIcon
                icon="mdi:image-off-outline"
                width={40}
                color={alpha(theme.palette.text.secondary, 0.5)}
            />
            <Typography
                variant="caption"
                sx={{
                    color: alpha(theme.palette.text.secondary, 0.6),
                    mt: 1,
                    textAlign: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                }}
            >
                No Logo Yet
            </Typography>
            <Typography
                variant="caption"
                sx={{
                    color: alpha(theme.palette.text.secondary, 0.4),
                    mt: 0.5,
                    textAlign: 'center',
                    fontSize: '0.6rem',
                }}
            >
                Upload a logo to personalize your school
            </Typography>
        </Box>
    );

    const renderStatusChips = () => (
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
    );

    const renderSchoolInfoCard = () => (
        <Box
            sx={{
                flex: { xs: '1 1 100%', md: '1 1 58%' },
                minWidth: { xs: '100%', md: '300px' },
            }}
        >
            <Card
                sx={{
                    p: { xs: 3, sm: 4, md: 5 },
                    borderRadius: 4,
                    bgcolor: 'background.default',
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    transition: 'all 0.3s ease',
                    height: '100%',
                    '&:hover': {
                        boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.08)}`,
                        transform: 'translateY(-4px)',
                    },
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
                    {renderLogoPlaceholder()}

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

                        {renderStatusChips()}

                        <Typography
                            variant="body1"
                            sx={{
                                color: 'text.secondary',
                                fontSize: { xs: '0.875rem', sm: '0.95rem' },
                                lineHeight: 1.7,
                            }}
                        >
                            Welcome aboard! We're excited to have you here. Manage your academic
                            activities, track progress, and achieve excellence.
                        </Typography>
                    </Box>
                </Box>
            </Card>
        </Box>
    );

    const renderAcademicInfoCard = () => (
        <Box
            sx={{
                flex: { xs: '1 1 100%', md: '1 1 38%' },
                minWidth: { xs: '100%', md: '280px' },
            }}
        >
            <Card
                sx={{
                    p: { xs: 3, sm: 4, md: 5 },
                    borderRadius: 4,
                    bgcolor: 'background.default',
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    transition: 'all 0.3s ease',
                    height: '100%',
                    '&:hover': {
                        boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.08)}`,
                        transform: 'translateY(-4px)',
                    },
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
                            {getCurrentSessionLabel()}
                        </Typography>
                    </Box>
                </Box>

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
                            {getCurrentTermLabel()}
                        </Typography>
                    </Box>
                </Box>
            </Card>
        </Box>
    );

    const renderFooter = () => (
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
            <Stack
                direction="row"
                spacing={1}
                justifyContent="center"
                alignItems="center"
                flexWrap="wrap"
            >
                <IconifyIcon
                    icon="mdi:quote-open"
                    width={18}
                    color={theme.palette.primary.main}
                />
                <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', fontStyle: 'italic' }}
                >
                    Excellence in education is not a destination, but a continuous journey
                </Typography>
                <IconifyIcon
                    icon="mdi:quote-close"
                    width={18}
                    color={theme.palette.primary.main}
                />
            </Stack>
        </Box>
    );

    const renderWelcomeHeader = () => (
        <Box sx={{ mb: { xs: 4, sm: 5, md: 6 } }}>
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
    );

    const renderMainContent = () => (
        <Box
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 4,
                width: '100%',
            }}
        >
            {renderSchoolInfoCard()}
            {renderAcademicInfoCard()}
        </Box>
    );

    if (loading || isEnumsLoading) {
        return renderLoading();
    }

    if (error) {
        return renderError();
    }

    return (
        <Box
            sx={{
                minHeight: '50%',
                bgcolor: 'background.default',
                py: { xs: 3, sm: 4, md: 5 },
                px: { xs: 2, sm: 3, md: 4 },
            }}
        >
            <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
                {renderWelcomeHeader()}

                {renderMainContent()}

                {renderFooter()}
            </Box>
        </Box>
    );
};

export default SchoolDashboard;
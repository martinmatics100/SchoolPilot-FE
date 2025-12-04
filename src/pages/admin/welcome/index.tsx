import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Card, CardContent, Grid, CircularProgress } from '@mui/material';
import Image from '../../../components/base/image';
import { useTheme } from "@mui/material";
import { useEnums } from '../../../hooks/useEnums';
import image from "../../../assets/palmfitLogoWithText.png";
import { SchoolService } from '../../../api/schoolService';
import { type SchoolDetails } from '../../../types/interfaces/i-school';

const Index = () => {
    const theme = useTheme();
    const { enums, isLoading: isEnumsLoading } = useEnums({ fetchPermissionData: false });
    const [schoolData, setSchoolData] = useState<SchoolDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    // Customizable styles
    const primaryColor = theme.palette.text.secondary;
    const secondaryColor = theme.palette.background.default;
    const fontFamily = 'Roboto, sans-serif';

    if (loading || isEnumsLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '50%',
                backgroundColor: secondaryColor,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                p: { xs: 2, sm: 4 },
            }}
        >
            <Grid container spacing={3} sx={{ maxWidth: '1200px', width: '100%' }}>
                {/* School Name and Logo Card (70% width) */}
                <Grid item xs={12} md={8.4}>
                    <Card
                        sx={{
                            p: { xs: 2, sm: 3 },
                            textAlign: 'center',
                            borderColor: theme.palette.divider,
                            backgroundColor: theme.palette.background.default,
                            transition: 'transform 0.3s',
                            '&:hover': { transform: 'scale(1.02)' },
                            overflow: 'visible',
                            minHeight: { xs: 'auto', sm: '250px' },
                        }}
                    >
                        <CardContent
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '100%',
                                p: 0,
                            }}
                        >
                            <Image
                                src={image}
                                alt={`${schoolData?.schoolName || 'School'} Logo`}
                                sx={{
                                    width: { xs: '80px', sm: '120px', md: '150px' },
                                    height: 'auto',
                                    maxWidth: '100%',
                                    mb: 2,
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    objectFit: 'contain',
                                }}
                            />
                            <Typography
                                variant="h4"
                                sx={{
                                    fontFamily: fontFamily,
                                    color: primaryColor,
                                    fontWeight: 700,
                                    mb: 1,
                                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                                    wordBreak: 'break-word',
                                    maxWidth: '100%',
                                }}
                            >
                                {schoolData?.schoolName || 'Not available'}
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    fontFamily: fontFamily,
                                    color: primaryColor,
                                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                                    wordBreak: 'break-word',
                                    maxWidth: '100%',
                                }}
                            >
                                Welcome aboard! 🚀
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Session and Term Card (30% width) */}
                <Grid item xs={12} md={3.6}>
                    <Card
                        sx={{
                            p: { xs: 2, sm: 3 },
                            textAlign: 'center',
                            borderRadius: 2,
                            borderColor: theme.palette.divider,
                            backgroundColor: theme.palette.background.default,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            overflow: 'visible',
                        }}
                    >
                        <CardContent
                            sx={{
                                p: 0,
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{
                                    fontFamily: fontFamily,
                                    color: primaryColor,
                                    fontWeight: 600,
                                    mb: 2,
                                    fontSize: { xs: '1.2rem', sm: '1.5rem' },
                                }}
                            >
                                Academic Information
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    fontFamily: fontFamily,
                                    color: primaryColor,
                                    mb: 1,
                                    fontSize: { xs: '0.9rem', sm: '1rem' },
                                }}
                            >
                                <strong style={{ color: theme.palette.text.primary }}>Active Academic Session:</strong> {schoolData?.currentSession ? sessionMap[schoolData.currentSession.toString()] || 'Not available' : 'Not Set Yet'}
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    fontFamily: fontFamily,
                                    color: primaryColor,
                                    fontSize: { xs: '0.9rem', sm: '1rem' },
                                }}
                            >
                                <strong style={{ color: theme.palette.text.primary }}>Active Term:</strong> {schoolData?.currentTerm ? termMap[schoolData.currentTerm.toString()] || 'Not available' : 'Not Set Yet'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Index;
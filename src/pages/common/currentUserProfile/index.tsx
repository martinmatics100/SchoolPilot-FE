import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Paper,
    Avatar,
    Typography,
    Grid,
    Chip,
    Divider,
    IconButton,
    Button,
    Skeleton,
    Card,
    CardContent,
    alpha,
    useTheme,
    Stack,
    Tooltip,
    Badge,
} from '@mui/material';
import {
    Edit as EditIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    School as SchoolIcon,
    CalendarToday as CalendarIcon,
    Female as FemaleIcon,
    Male as MaleIcon,
    Transgender as TransgenderIcon,
    Badge as BadgeIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    Share as ShareIcon,
    Download as DownloadIcon,
    Verified as VerifiedIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../context';
import { getUserProfile } from '../../../api/userService';

interface UserProfileData {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: {
        number: string;
        extension?: string;
        country: string;
    };
    address?: {
        addressLine1: string;
        addressLine2?: string;
        city?: string;
        state: string;
        zipCode?: string;
        country: string;
    };
    photoUrl?: string;
    role: string;
    status: string;
    dateOfBirth?: string;
    dateOfHire?: string;
    schoolName: string;
    gender?: string;
    createdAt?: string;
}

const UserProfile: React.FC = () => {
    const theme = useTheme();
    const { apiClient, selectedAccount, currentUser } = useAuth();
    const [profile, setProfile] = useState<UserProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                // Replace with your actual API call
                const data = await getUserProfile(selectedAccount!, currentUser?.id!);
                setProfile(data);
            } catch (err) {
                setError('Failed to load profile');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (selectedAccount && currentUser?.id) {
            fetchProfile();
        }
    }, [selectedAccount, currentUser]);

    const getGenderIcon = (gender?: string) => {
        // if (gender?.toLowerCase() === 'male') return <MaleIcon />;
        // if (gender?.toLowerCase() === 'female') return <FemaleIcon />;
        return <TransgenderIcon />;
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not specified';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" gap={3} mb={4}>
                        <Skeleton variant="circular" width={120} height={120} />
                        <Box flex={1}>
                            <Skeleton variant="text" width="60%" height={40} />
                            <Skeleton variant="text" width="40%" height={24} />
                            <Skeleton variant="text" width="30%" height={20} />
                        </Box>
                    </Box>
                    <Grid container spacing={3}>
                        {[1, 2, 3, 4].map((i) => (
                            <Grid item xs={12} md={6} key={i}>
                                <Skeleton variant="rectangular" height={80} />
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            </Container>
        );
    }

    if (error || !profile) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="error" variant="h6">
                        {error || 'Profile not found'}
                    </Typography>
                    <Button variant="contained" sx={{ mt: 2 }} onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(
                    theme.palette.background.default,
                    0.08
                )} 100%)`,
                py: 4,
            }}
        >
            <Container maxWidth="lg">
                {/* Header Card with Cover Photo Effect */}
                <Paper
                    elevation={0}
                    sx={{
                        position: 'relative',
                        borderRadius: 4,
                        overflow: 'hidden',
                        mb: 3,
                        background: `linear-gradient(120deg, ${theme.palette.background.default} 0%, ${theme.palette.background.default} 100%)`,
                        bgcolor: theme.palette.background.default,
                        color: 'white',
                    }}
                >
                    <Box sx={{ p: { xs: 3, md: 4 } }}>
                        <Box display="flex" justifyContent="flex-end" mb={2}>
                            <Tooltip title="Edit Profile">
                                <IconButton
                                    sx={{
                                        bgcolor: alpha(theme.palette.common.white, 0.2),
                                        color: 'white',
                                        '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.3) },
                                    }}
                                >
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>

                        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems="center" gap={4}>
                            <Badge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                badgeContent={
                                    <VerifiedIcon
                                        sx={{
                                            fontSize: 32,
                                            color: theme.palette.success.main,
                                            bgcolor: 'white',
                                            borderRadius: '50%',
                                            p: 0.5,
                                        }}
                                    />
                                }
                            >
                                <Avatar
                                    src={profile.photoUrl}
                                    alt={`${profile.firstName} ${profile.lastName}`}
                                    sx={{
                                        width: 150,
                                        height: 150,
                                        border: '4px solid white',
                                        boxShadow: theme.shadows[8],
                                        bgcolor: theme.palette.primary.dark,
                                        fontSize: 48,
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {!profile.photoUrl && `${profile.firstName[0]}${profile.lastName[0]}`}
                                </Avatar>
                            </Badge>

                            <Box textAlign={{ xs: 'center', md: 'left' }}>
                                <Typography variant="h4" fontWeight="bold" gutterBottom>
                                    {profile.firstName} {profile.lastName}
                                </Typography>
                                <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', md: 'flex-start' }} mb={1}>
                                    <Chip
                                        icon={getGenderIcon(profile.gender)}
                                        label={profile.gender || 'Not specified'}
                                        size="small"
                                        sx={{ bgcolor: alpha(theme.palette.common.white, 0.2), color: 'white' }}
                                    />
                                    <Chip
                                        label={profile.role}
                                        size="small"
                                        sx={{ bgcolor: alpha(theme.palette.common.white, 0.2), color: 'white' }}
                                    />
                                    {profile.status === 'Active' && (
                                        <Chip
                                            label="Active"
                                            size="small"
                                            icon={<StarIcon sx={{ fontSize: 16 }} />}
                                            sx={{ bgcolor: alpha(theme.palette.success.main, 0.9), color: 'white' }}
                                        />
                                    )}
                                </Stack>
                                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                    {profile.schoolName}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Paper>

                {/* Main Content */}
                <Grid container spacing={3}>
                    {/* Contact Information */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={0} sx={{ borderRadius: 3, height: '100%', bgcolor: theme.palette.background.default }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" gutterBottom mb={2}>
                                    Contact Information
                                </Typography>
                                <Stack spacing={2}>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 2,
                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <EmailIcon sx={{ color: theme.palette.primary.main }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Email Address
                                            </Typography>
                                            <Typography variant="body1">{profile.email}</Typography>
                                        </Box>
                                    </Box>

                                    {profile.phoneNumber && (
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 2,
                                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <PhoneIcon sx={{ color: theme.palette.primary.main }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Phone Number
                                                </Typography>
                                                <Typography variant="body1">
                                                    {profile.phoneNumber.extension && `+${profile.phoneNumber.extension} `}
                                                    {profile.phoneNumber.number}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}

                                    {profile.address && (
                                        <Box display="flex" alignItems="flex-start" gap={2}>
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 2,
                                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <LocationIcon sx={{ color: theme.palette.primary.main }} />
                                            </Box>
                                            <Box flex={1}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Address
                                                </Typography>
                                                <Typography variant="body1">
                                                    {profile.address.addressLine1}
                                                    {profile.address.addressLine2 && `, ${profile.address.addressLine2}`}
                                                    <br />
                                                    {profile.address.city && `${profile.address.city}, `}
                                                    {profile.address.state} {profile.address.zipCode}
                                                    <br />
                                                    {profile.address.country}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Personal Information */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={0} sx={{ borderRadius: 3, height: '100%', bgcolor: theme.palette.background.default }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" gutterBottom mb={2}>
                                    Personal Information
                                </Typography>
                                <Stack spacing={2}>
                                    {profile.dateOfBirth && (
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 2,
                                                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <CalendarIcon sx={{ color: theme.palette.secondary.main }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Date of Birth
                                                </Typography>
                                                <Typography variant="body1">{formatDate(profile.dateOfBirth)}</Typography>
                                            </Box>
                                        </Box>
                                    )}

                                    {profile.dateOfHire && (
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 2,
                                                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <BadgeIcon sx={{ color: theme.palette.secondary.main }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Date of Hire
                                                </Typography>
                                                <Typography variant="body1">{formatDate(profile.dateOfHire)}</Typography>
                                            </Box>
                                        </Box>
                                    )}

                                    {profile.createdAt && (
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 2,
                                                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <SchoolIcon sx={{ color: theme.palette.secondary.main }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Member Since
                                                </Typography>
                                                <Typography variant="body1">{formatDate(profile.createdAt)}</Typography>
                                            </Box>
                                        </Box>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Statistics / Quick Actions */}
                    <Grid item xs={12}>
                        <Card elevation={0} sx={{ borderRadius: 3, height: '100%', bgcolor: theme.palette.background.default }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" gutterBottom mb={3}>
                                    Quick Actions
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            startIcon={<ShareIcon />}
                                            sx={{
                                                py: 1.5,
                                                borderRadius: 2,
                                                borderColor: alpha(theme.palette.primary.main, 0.3),
                                                '&:hover': {
                                                    borderColor: theme.palette.primary.main,
                                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                },
                                            }}
                                        >
                                            Share Profile
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            startIcon={<DownloadIcon />}
                                            sx={{
                                                py: 1.5,
                                                borderRadius: 2,
                                                borderColor: alpha(theme.palette.primary.main, 0.3),
                                                '&:hover': {
                                                    borderColor: theme.palette.primary.main,
                                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                },
                                            }}
                                        >
                                            Export Data
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            startIcon={<EditIcon />}
                                            sx={{
                                                py: 1.5,
                                                borderRadius: 2,
                                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                            }}
                                        >
                                            Edit Profile
                                        </Button>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box >
    );
};

export default UserProfile;
import React, { useEffect, useState, useMemo } from 'react';
import {
    Box,
    Container,
    Paper,
    Avatar,
    Typography,
    Chip,
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
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
    Verified as VerifiedIcon,
    Close as CloseIcon,
    Save as SaveIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../context';
import { getUserProfile, updateUserProfile } from '../../../api/userService';
import { useEnums } from '../../../hooks/useEnums';

interface UserProfileData {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: {
        number: string;
        extension?: string;
        phoneType: number;
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
    role: number;
    status: number;
    dateOfBirth?: string;
    dateOfHire?: string;
    schoolName: string;
    gender?: number;
    createdAt?: string;
}

interface EditProfileFormData {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    phoneType: number;
    addressLine1: string;
    city: string;
    state: string;
    country: string;
    gender: number;
    dateOfBirth: string;
}

const CurrentUserProfile: React.FC = () => {
    const theme = useTheme();
    const { selectedAccount, currentUser } = useAuth();
    const { enums, isLoading: isEnumsLoading } = useEnums({ fetchPermissionData: false });
    const [profile, setProfile] = useState<UserProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [editSuccess, setEditSuccess] = useState(false);

    // Map enums - with fallback for role
    const genderMap = useMemo(() => {
        return (
            enums?.Gender?.reduce(
                (acc: Record<string, string>, item: { value: number; displayName: string; name: string }) => {
                    acc[item.value] = item.displayName || item.name;
                    return acc;
                },
                {}
            ) || {}
        );
    }, [enums]);

    const statusMap = useMemo(() => {
        return (
            enums?.UserStatus?.reduce(
                (acc: Record<string, string>, item: { value: number; displayName: string; name: string }) => {
                    acc[item.value] = item.displayName || item.name;
                    return acc;
                },
                {}
            ) || {}
        );
    }, [enums]);

    const roleMap = useMemo(() => {
        const roles = enums?.UserRole || enums?.Roles || enums?.Role;
        return (
            roles?.reduce(
                (acc: Record<string, string>, item: { value: number; displayName: string; name: string }) => {
                    acc[item.value] = item.displayName || item.name;
                    return acc;
                },
                {}
            ) || {}
        );
    }, [enums]);

    const phoneTypeMap = useMemo(() => {
        return (
            enums?.PhoneType?.reduce(
                (acc: Record<string, string>, item: { value: number; displayName: string; name: string }) => {
                    acc[item.value] = item.displayName || item.name;
                    return acc;
                },
                {}
            ) || {}
        );
    }, [enums]);

    const countryMap = useMemo(() => {
        return (
            enums?.Country?.reduce(
                (acc: Record<string, string>, item: { value: number; displayName: string; name: string }) => {
                    acc[item.value] = item.displayName || item.name;
                    return acc;
                },
                {}
            ) || {}
        );
    }, [enums]);

    // Edit form state
    const [editFormData, setEditFormData] = useState<EditProfileFormData>({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        phoneType: 0,
        addressLine1: '',
        city: '',
        state: '',
        country: '',
        gender: 0,
        dateOfBirth: '',
    });

    // Form validation errors
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
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

    const getGenderLabel = (genderValue?: number): string => {
        if (genderValue === undefined || genderValue === null) return 'Not specified';
        return genderMap[genderValue.toString()] || 'Not specified';
    };

    const getStatusLabel = (statusValue?: number): string => {
        if (statusValue === undefined || statusValue === null) return 'Not specified';
        return statusMap[statusValue.toString()] || 'Not specified';
    };

    const getRoleLabel = (roleValue?: number): string => {
        if (roleValue === undefined || roleValue === null) return 'Not specified';
        const label = roleMap[roleValue.toString()];
        if (label) return label;

        const fallbackRoles: Record<number, string> = {
            0: 'Admin',
            1: 'Teacher',
            2: 'Student',
            3: 'Parent',
            4: 'Staff',
        };
        return fallbackRoles[roleValue] || `Role ${roleValue}`;
    };

    const getPhoneTypeLabel = (typeValue?: number): string => {
        if (typeValue === undefined || typeValue === null) return 'Not specified';
        return phoneTypeMap[typeValue.toString()] || 'Not specified';
    };

    const getCountryLabel = (countryValue?: string | number): string => {
        if (!countryValue) return 'Not specified';
        return countryMap[countryValue.toString()] || 'Not specified';
    };

    const getGenderIcon = (genderValue?: number) => {
        const gender = getGenderLabel(genderValue).toLowerCase();
        if (gender === 'male') return <MaleIcon />;
        if (gender === 'female') return <FemaleIcon />;
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

    const handleOpenEditModal = () => {
        if (profile) {
            setEditFormData({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                email: profile.email || '',
                phoneNumber: profile.phoneNumber?.number || '',
                phoneType: profile.phoneNumber?.phoneType || 0,
                addressLine1: profile.address?.addressLine1 || '',
                city: profile.address?.city || '',
                state: profile.address?.state || '',
                country: profile.address?.country || '',
                gender: profile.gender || 0,
                dateOfBirth: profile.dateOfBirth?.split('T')[0] || '',
            });
            setFormErrors({});
            setEditError(null);
            setEditSuccess(false);
            setEditModalOpen(true);
        }
    };

    const handleEditClose = () => {
        setEditModalOpen(false);
        setEditError(null);
        setEditSuccess(false);
    };

    const handleEditChange = (field: keyof EditProfileFormData, value: any) => {
        setEditFormData(prev => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateEditForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!editFormData.firstName.trim()) errors.firstName = 'First name is required';
        if (!editFormData.lastName.trim()) errors.lastName = 'Last name is required';
        if (!editFormData.email.trim()) errors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
            errors.email = 'Invalid email format';
        }
        if (!editFormData.phoneNumber.trim()) errors.phoneNumber = 'Phone number is required';
        if (!editFormData.addressLine1.trim()) errors.addressLine1 = 'Address is required';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleEditSubmit = async () => {
        if (!validateEditForm()) return;

        setEditLoading(true);
        setEditError(null);

        try {
            const payload = {
                firstName: editFormData.firstName,
                lastName: editFormData.lastName,
                email: editFormData.email,
                phoneNumber: {
                    number: editFormData.phoneNumber,
                    phoneType: editFormData.phoneType,
                    country: editFormData.country || '566',
                },
                address: {
                    addressLine1: editFormData.addressLine1,
                    city: editFormData.city,
                    state: editFormData.state,
                    country: editFormData.country || '566',
                },
                gender: editFormData.gender,
                dateOfBirth: editFormData.dateOfBirth,
            };

            await updateUserProfile(selectedAccount!, currentUser?.id!, payload);

            const updatedProfile = await getUserProfile(selectedAccount!, currentUser?.id!);
            setProfile(updatedProfile);

            setEditSuccess(true);
            setTimeout(() => {
                setEditModalOpen(false);
                setEditSuccess(false);
            }, 1500);
        } catch (err: any) {
            setEditError(err.message || 'Failed to update profile');
        } finally {
            setEditLoading(false);
        }
    };

    if (loading || isEnumsLoading) {
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
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                        {[1, 2, 3, 4].map((i) => (
                            <Box key={i} sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '280px' }}>
                                <Skeleton variant="rectangular" height={80} />
                            </Box>
                        ))}
                    </Box>
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
                {/* Header Card */}
                <Paper
                    elevation={0}
                    sx={{
                        position: 'relative',
                        borderRadius: 4,
                        overflow: 'hidden',
                        mb: 3,
                        background: `linear-gradient(120deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                        color: 'white',
                    }}
                >
                    <Box sx={{ p: { xs: 3, md: 4 } }}>
                        <Box display="flex" justifyContent="flex-end" mb={2}>
                            <Tooltip title="Edit Profile">
                                <IconButton
                                    onClick={handleOpenEditModal}
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
                                <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', md: 'flex-start' }} mb={1} flexWrap="wrap" gap={1}>
                                    <Chip
                                        icon={getGenderIcon(profile.gender)}
                                        label={getGenderLabel(profile.gender)}
                                        size="small"
                                        sx={{ bgcolor: alpha(theme.palette.common.white, 0.2), color: 'white' }}
                                    />
                                    <Chip
                                        label={getRoleLabel(profile.role)}
                                        size="small"
                                        sx={{ bgcolor: alpha(theme.palette.common.white, 0.2), color: 'white' }}
                                    />
                                    <Chip
                                        label={getStatusLabel(profile.status)}
                                        size="small"
                                        icon={<StarIcon sx={{ fontSize: 16 }} />}
                                        sx={{
                                            bgcolor: profile.status === 1
                                                ? alpha(theme.palette.success.main, 0.9)
                                                : alpha(theme.palette.warning.main, 0.9),
                                            color: 'white',
                                        }}
                                    />
                                </Stack>
                                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                    {profile.schoolName}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Paper>

                {/* Main Content - Two Column Layout */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {/* Contact Information */}
                    <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '300px' }}>
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 3,
                                height: '100%',
                                minHeight: 320,
                                bgcolor: theme.palette.background.default,
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <CardContent sx={{ flex: 1 }}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom mb={3}>
                                    Contact Information
                                </Typography>
                                <Stack spacing={2.5}>
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
                                                flexShrink: 0,
                                            }}
                                        >
                                            <EmailIcon sx={{ color: theme.palette.primary.main }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">
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
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <PhoneIcon sx={{ color: theme.palette.primary.main }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Phone Number ({getPhoneTypeLabel(profile.phoneNumber.phoneType)})
                                                </Typography>
                                                <Typography variant="body1">
                                                    +{profile.phoneNumber.country} {profile.phoneNumber.number}
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
                                                    flexShrink: 0,
                                                    mt: 0.5,
                                                }}
                                            >
                                                <LocationIcon sx={{ color: theme.palette.primary.main }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Address
                                                </Typography>
                                                <Typography variant="body1" sx={{ wordWrap: 'break-word' }}>
                                                    {profile.address.addressLine1}
                                                    {profile.address.addressLine2 && `, ${profile.address.addressLine2}`}
                                                    {profile.address.city && <>, {profile.address.city}</>}
                                                    {profile.address.state && <>, {profile.address.state}</>}
                                                    {profile.address.country && (
                                                        <>, {getCountryLabel(profile.address.country)}</>
                                                    )}
                                                    {profile.address.zipCode && <>, {profile.address.zipCode}</>}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Box>

                    {/* Personal Information */}
                    <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '300px' }}>
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 3,
                                height: '100%',
                                minHeight: 320,
                                bgcolor: theme.palette.background.default,
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <CardContent sx={{ flex: 1 }}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom mb={3}>
                                    Personal Information
                                </Typography>
                                <Stack spacing={2.5}>
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
                                                flexShrink: 0,
                                            }}
                                        >
                                            <CalendarIcon sx={{ color: theme.palette.secondary.main }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Date of Birth
                                            </Typography>
                                            <Typography variant="body1">{formatDate(profile.dateOfBirth)}</Typography>
                                        </Box>
                                    </Box>

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
                                                flexShrink: 0,
                                            }}
                                        >
                                            <BadgeIcon sx={{ color: theme.palette.secondary.main }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Status
                                            </Typography>
                                            <Typography variant="body1">{getStatusLabel(profile.status)}</Typography>
                                        </Box>
                                    </Box>

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
                                                flexShrink: 0,
                                            }}
                                        >
                                            <SchoolIcon sx={{ color: theme.palette.secondary.main }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Role
                                            </Typography>
                                            <Typography variant="body1">{getRoleLabel(profile.role)}</Typography>
                                        </Box>
                                    </Box>

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
                                                flexShrink: 0,
                                            }}
                                        >
                                            <TransgenderIcon sx={{ color: theme.palette.secondary.main }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Gender
                                            </Typography>
                                            <Typography variant="body1">{getGenderLabel(profile.gender)}</Typography>
                                        </Box>
                                    </Box>

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
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <SchoolIcon sx={{ color: theme.palette.secondary.main }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Member Since
                                                </Typography>
                                                <Typography variant="body1">{formatDate(profile.createdAt)}</Typography>
                                            </Box>
                                        </Box>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </Container>

            {/* Edit Profile Modal */}
            <Dialog
                open={editModalOpen}
                onClose={handleEditClose}
                maxWidth="md"
                fullWidth
                fullScreen={window.innerWidth < 600}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        bgcolor: theme.palette.background.default,
                    },
                }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    pb: 2,
                }}>
                    <Typography variant="h6" fontWeight="bold">
                        Edit Profile
                    </Typography>
                    <IconButton onClick={handleEditClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ pt: 3, pb: 2 }}>
                    {editSuccess && (
                        <Box sx={{
                            p: 2,
                            mb: 3,
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                        }}>
                            <Typography color="success.main">Profile updated successfully!</Typography>
                        </Box>
                    )}

                    {editError && (
                        <Box sx={{
                            p: 2,
                            mb: 3,
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                        }}>
                            <Typography color="error.main">{editError}</Typography>
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5 }}>
                        <Box sx={{ flex: '1 1 calc(50% - 10px)', minWidth: '200px' }}>
                            <TextField
                                label="First Name"
                                value={editFormData.firstName}
                                onChange={(e) => handleEditChange('firstName', e.target.value)}
                                error={!!formErrors.firstName}
                                helperText={formErrors.firstName}
                                fullWidth
                                required
                                size="medium"
                            />
                        </Box>
                        <Box sx={{ flex: '1 1 calc(50% - 10px)', minWidth: '200px' }}>
                            <TextField
                                label="Last Name"
                                value={editFormData.lastName}
                                onChange={(e) => handleEditChange('lastName', e.target.value)}
                                error={!!formErrors.lastName}
                                helperText={formErrors.lastName}
                                fullWidth
                                required
                                size="medium"
                            />
                        </Box>

                        <Box sx={{ flex: '1 1 100%' }}>
                            <TextField
                                label="Email Address"
                                type="email"
                                value={editFormData.email}
                                onChange={(e) => handleEditChange('email', e.target.value)}
                                error={!!formErrors.email}
                                helperText={formErrors.email}
                                fullWidth
                                required
                                size="medium"
                            />
                        </Box>

                        <Box sx={{ flex: '1 1 calc(66.666% - 10px)', minWidth: '200px' }}>
                            <TextField
                                label="Phone Number"
                                value={editFormData.phoneNumber}
                                onChange={(e) => handleEditChange('phoneNumber', e.target.value)}
                                error={!!formErrors.phoneNumber}
                                helperText={formErrors.phoneNumber}
                                fullWidth
                                required
                                size="medium"
                            />
                        </Box>
                        <Box sx={{ flex: '1 1 calc(33.333% - 10px)', minWidth: '150px' }}>
                            <FormControl fullWidth size="medium">
                                <InputLabel>Phone Type</InputLabel>
                                <Select
                                    value={editFormData.phoneType}
                                    onChange={(e) => handleEditChange('phoneType', e.target.value)}
                                    label="Phone Type"
                                >
                                    {Object.entries(phoneTypeMap).map(([value, label]) => (
                                        <MenuItem key={value} value={Number(value)}>
                                            {label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        <Box sx={{ flex: '1 1 100%' }}>
                            <TextField
                                label="Address"
                                value={editFormData.addressLine1}
                                onChange={(e) => handleEditChange('addressLine1', e.target.value)}
                                error={!!formErrors.addressLine1}
                                helperText={formErrors.addressLine1}
                                fullWidth
                                required
                                size="medium"
                            />
                        </Box>

                        <Box sx={{ flex: '1 1 calc(50% - 10px)', minWidth: '200px' }}>
                            <TextField
                                label="City"
                                value={editFormData.city}
                                onChange={(e) => handleEditChange('city', e.target.value)}
                                fullWidth
                                size="medium"
                            />
                        </Box>
                        <Box sx={{ flex: '1 1 calc(50% - 10px)', minWidth: '200px' }}>
                            <TextField
                                label="State"
                                value={editFormData.state}
                                onChange={(e) => handleEditChange('state', e.target.value)}
                                fullWidth
                                size="medium"
                            />
                        </Box>

                        <Box sx={{ flex: '1 1 calc(50% - 10px)', minWidth: '200px' }}>
                            <FormControl fullWidth size="medium">
                                <InputLabel>Gender</InputLabel>
                                <Select
                                    value={editFormData.gender}
                                    onChange={(e) => handleEditChange('gender', e.target.value)}
                                    label="Gender"
                                >
                                    {Object.entries(genderMap).map(([value, label]) => (
                                        <MenuItem key={value} value={Number(value)}>
                                            {label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        <Box sx={{ flex: '1 1 calc(50% - 10px)', minWidth: '200px' }}>
                            <TextField
                                label="Date of Birth"
                                type="date"
                                value={editFormData.dateOfBirth}
                                onChange={(e) => handleEditChange('dateOfBirth', e.target.value)}
                                fullWidth
                                size="medium"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions sx={{
                    p: 2.5,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    gap: 1,
                }}>
                    <Button
                        onClick={handleEditClose}
                        variant="outlined"
                        disabled={editLoading}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleEditSubmit}
                        variant="contained"
                        disabled={editLoading}
                        startIcon={editLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            '&:hover': {
                                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                            },
                        }}
                    >
                        {editLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CurrentUserProfile;
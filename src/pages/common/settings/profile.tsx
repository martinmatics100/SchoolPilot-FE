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
    Divider,
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
    Work as WorkIcon,
    Person as PersonIcon,
    Error as ErrorIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../context';
import { getUserProfile, updateUserProfile } from '../../../api/userService';
import { useEnums } from '../../../hooks/useEnums';
import DynamicForm, { type FormField } from '../../../components/my-form';
import MessageDisplay from '../../../components/message-display';

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
    const [formFields, setFormFields] = useState<FormField[]>([]);
    const [initialValues, setInitialValues] = useState<Record<string, any>>({});

    // Map enums
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

    // Build form fields when enums and profile are available
    useEffect(() => {
        if (!isEnumsLoading && enums && profile) {
            const fields: FormField[] = [
                {
                    name: "firstName",
                    label: "First Name",
                    type: "text",
                    required: true,
                    colSpan: 1,
                },
                {
                    name: "lastName",
                    label: "Last Name",
                    type: "text",
                    required: true,
                    colSpan: 1,
                },
                {
                    name: "email",
                    label: "Email Address",
                    type: "email",
                    required: true,
                    colSpan: 2,
                },
                {
                    name: "gender",
                    label: "Gender",
                    type: "select",
                    required: true,
                    colSpan: 1,
                    options:
                        enums.Gender?.map((g: any) => ({
                            value: g.value.toString(),
                            label: g.displayName || g.name,
                        })) || [],
                },
                {
                    name: "dateOfBirth",
                    label: "Date of Birth",
                    type: "date",
                    required: false,
                    colSpan: 1,
                },
                {
                    name: "phoneNumber",
                    label: "Phone Number",
                    type: "phone",
                    required: false,
                    colSpan: 2,
                    extraProps: {
                        enums: {
                            PhoneType: enums?.PhoneType || [],
                            Country: enums?.Country || []
                        }
                    }
                },
                {
                    name: "address",
                    label: "Address",
                    type: "address",
                    required: false,
                    colSpan: 2,
                },
            ];

            setFormFields(fields);

            // Set initial values
            setInitialValues({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                email: profile.email || '',
                gender: profile.gender?.toString() || '',
                dateOfBirth: profile.dateOfBirth?.split('T')[0] || '',
                phoneNumber: {
                    number: profile.phoneNumber?.number || '',
                    extension: profile.phoneNumber?.extension || '',
                    phoneType: profile.phoneNumber?.phoneType?.toString() || '',
                    country: profile.phoneNumber?.country || '',
                },
                address: {
                    addressLine1: profile.address?.addressLine1 || '',
                    addressLine2: profile.address?.addressLine2 || '',
                    city: profile.address?.city || '',
                    state: profile.address?.state || '',
                    zipCode: profile.address?.zipCode || '',
                    country: profile.address?.country || '',
                },
            });
        }
    }, [enums, isEnumsLoading, profile]);

    // Helper functions with "Not available" handling
    const getGenderLabel = (genderValue?: number): string => {
        if (genderValue === undefined || genderValue === null) return 'Not available';
        return genderMap[genderValue.toString()] || 'Not available';
    };

    const getStatusLabel = (statusValue?: number): string => {
        if (statusValue === undefined || statusValue === null) return 'Not available';
        return statusMap[statusValue.toString()] || 'Not available';
    };

    const getRoleLabel = (roleValue?: number): string => {
        if (roleValue === undefined || roleValue === null) return 'Not available';
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
        if (typeValue === undefined || typeValue === null) return 'Not available';
        return phoneTypeMap[typeValue.toString()] || 'Not available';
    };

    const getCountryLabel = (countryValue?: string | number): string => {
        if (!countryValue) return 'Not available';
        return countryMap[countryValue.toString()] || 'Not available';
    };

    const getGenderIcon = (genderValue?: number) => {
        const gender = getGenderLabel(genderValue).toLowerCase();
        if (gender === 'male') return <MaleIcon />;
        if (gender === 'female') return <FemaleIcon />;
        return <TransgenderIcon />;
    };

    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'Not available';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return 'Not available';
        }
    };

    const getDisplayValue = (value: any, fallback: string = 'Not available'): string => {
        if (value === undefined || value === null || value === '') return fallback;
        return String(value);
    };

    const handleOpenEditModal = () => {
        setEditError(null);
        setEditSuccess(false);
        setEditModalOpen(true);
    };

    const handleEditClose = () => {
        setEditModalOpen(false);
        setEditError(null);
        setEditSuccess(false);
    };

    const handleEditSubmit = async (data: any) => {
        setEditLoading(true);
        setEditError(null);

        try {
            // Build the payload from form data
            const payload: any = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                gender: parseInt(data.gender) || 0,
                dateOfBirth: data.dateOfBirth || undefined,
            };

            // Add phone number if provided
            if (data.phoneNumber && data.phoneNumber.number) {
                payload.phoneNumber = {
                    number: data.phoneNumber.number,
                    phoneType: parseInt(data.phoneNumber.phoneType) || 0,
                    country: data.phoneNumber.country || '566',
                    extension: data.phoneNumber.extension || '',
                };
            }

            // Add address if provided
            if (data.address && data.address.addressLine1) {
                payload.address = {
                    addressLine1: data.address.addressLine1,
                    addressLine2: data.address.addressLine2 || '',
                    city: data.address.city || '',
                    state: data.address.state || '',
                    zipCode: data.address.zipCode || '',
                    country: data.address.country || '566',
                };
            }

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
                minHeight: '80vh',
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

                            <Box textAlign={{ xs: 'center', md: 'left' }} width="100%">
                                <Typography variant="h4" fontWeight="bold" gutterBottom>
                                    {profile.firstName || 'Not available'} {profile.lastName || ''}
                                </Typography>

                                <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', md: 'flex-start' }} flexWrap="wrap" gap={1}>
                                    <Chip
                                        icon={getGenderIcon(profile.gender)}
                                        label={getGenderLabel(profile.gender)}
                                        size="small"
                                        sx={{ bgcolor: alpha(theme.palette.common.white, 0.15), color: 'white' }}
                                    />
                                    <Chip
                                        icon={<WorkIcon sx={{ fontSize: 16 }} />}
                                        label={getRoleLabel(profile.role)}
                                        size="small"
                                        sx={{ bgcolor: alpha(theme.palette.common.white, 0.15), color: 'white' }}
                                    />
                                    <Chip
                                        icon={<StarIcon sx={{ fontSize: 16 }} />}
                                        label={getStatusLabel(profile.status)}
                                        size="small"
                                        sx={{
                                            bgcolor: profile.status === 1
                                                ? alpha(theme.palette.success.main, 0.9)
                                                : alpha(theme.palette.warning.main, 0.9),
                                            color: 'white',
                                        }}
                                    />
                                </Stack>

                                <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
                                    <SchoolIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                                    {getDisplayValue(profile.schoolName)}
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
                                            <Typography variant="body1">
                                                {getDisplayValue(profile.email)}
                                            </Typography>
                                        </Box>
                                    </Box>

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
                                                Phone Number ({getPhoneTypeLabel(profile.phoneNumber?.phoneType)})
                                            </Typography>
                                            <Typography variant="body1">
                                                {profile.phoneNumber ? (
                                                    `+${profile.phoneNumber.country || ''} ${profile.phoneNumber.number || ''}`
                                                ) : (
                                                    'Not available'
                                                )}
                                            </Typography>
                                        </Box>
                                    </Box>

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
                                                {profile.address ? (
                                                    <>
                                                        {getDisplayValue(profile.address.addressLine1)}
                                                        {profile.address.addressLine2 && `, ${profile.address.addressLine2}`}
                                                        {profile.address.city && `, ${profile.address.city}`}
                                                        {profile.address.state && `, ${profile.address.state}`}
                                                        {profile.address.country && `, ${getCountryLabel(profile.address.country)}`}
                                                        {profile.address.zipCode && `, ${profile.address.zipCode}`}
                                                    </>
                                                ) : (
                                                    'Not available'
                                                )}
                                            </Typography>
                                        </Box>
                                    </Box>
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
                                            <Typography variant="body1">
                                                {formatDate(profile.dateOfBirth)}
                                            </Typography>
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
                                            <PersonIcon sx={{ color: theme.palette.secondary.main }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Member Since
                                            </Typography>
                                            <Typography variant="body1">
                                                {formatDate(profile.createdAt)}
                                            </Typography>
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
                                            <WorkIcon sx={{ color: theme.palette.secondary.main }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Date of Hire
                                            </Typography>
                                            <Typography variant="body1">
                                                {formatDate(profile.dateOfHire)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </Container>

            {/* Edit Profile Modal - Using DynamicForm */}
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
                        maxHeight: '90vh',
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

                <DialogContent sx={{ pt: 3, pb: 2, overflowY: 'auto' }}>
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

                    {formFields.length > 0 && initialValues && (
                        <DynamicForm
                            title=""
                            fields={formFields}
                            onSubmit={handleEditSubmit}
                            submitButtonText={editLoading ? "Saving..." : "Save Changes"}
                            columns={2}
                            initialValues={initialValues}
                            submitDisabled={editLoading}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default CurrentUserProfile;
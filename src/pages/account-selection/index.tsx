import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Button,
    Typography,
    Modal,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    OutlinedInput,
    useTheme,
    Stepper,
    Step,
    StepLabel,
    CircularProgress,
    alpha,
    useMediaQuery,
    Stack,
    Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context';
import { type LocationModel } from '../../utils/apiClient';
import { fetchAndStoreAllEnums, getEnum } from '../../api/enumsApi';
import IconifyIcon from '../../components/base/iconifyIcon';
import { getFirstRouteForRole } from '../../utils/roleNavigation';

// ── Friendly labels for each step (simple English) ─────────────────────────
const STEP_LABELS = ['Your Role', 'Your School', 'Your Branch'];

const STEP_TITLES = [
    "What's your role?",
    'Which school do you work with?',
    'Which branch will you use?',
];

const STEP_SUBTITLES = [
    'Pick how you use SchoolPilot.',
    'Choose the school you want to manage.',
    'Select the branch you want to open.',
];

const AccountSelectionPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const {
        selectedAccount,
        setAccountSelection,
        accounts,
        userId,
        apiClient,
        accessToken,
        setAccounts: setAuthAccounts,
    } = useAuth();

    const [localSelectedAccount, setLocalSelectedAccount] = useState(selectedAccount || '');
    const [localSelectedBranches, setLocalSelectedBranches] = useState<LocationModel | null>(null);
    const [localSelectedRole, setLocalSelectedRole] = useState<string>('');
    const [availableRoles, setAvailableRoles] = useState<string[]>([]);
    const [schools, setSchools] = useState<any[]>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
    const [isLoadingSchools, setIsLoadingSchools] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeStep, setActiveStep] = useState(0);
    const [mounted, setMounted] = useState(false);

    // Trigger load animations
    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 50);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const initializeEnums = async () => {
            try {
                await fetchAndStoreAllEnums();
                const userRoles = await getEnum('UserRole');
                console.log('User roles enum:', userRoles);
            } catch (error) {
                console.error('Error loading enums:', error);
            }
        };
        initializeEnums();
    }, []);

    useEffect(() => {
        if (accessToken) {
            try {
                const tokenParts = accessToken.split('.');
                const decodedPayload = JSON.parse(atob(tokenParts[1]));
                const roles =
                    decodedPayload[
                    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
                    ];
                if (Array.isArray(roles)) {
                    setAvailableRoles(roles);
                } else if (roles) {
                    setAvailableRoles([roles]);
                }
            } catch (error) {
                console.error('Error parsing access token:', error);
            }
        }
    }, [accessToken]);

    const fetchAccounts = async () => {
        if (userId && activeStep >= 1 && localSelectedRole && accounts.length === 0) {
            setIsLoadingAccounts(true);
            setError(null);
            try {
                const response = await apiClient.getAccounts({
                    userId,
                    role: localSelectedRole,
                    page: 1,
                    pageLength: 100,
                });
                const fetchedAccounts = response.items.map((account: any) => ({
                    id: String(account.id),
                    name: account.name,
                    branches: [] as LocationModel[],
                }));
                setAuthAccounts(fetchedAccounts);
            } catch (err) {
                console.error('Failed to fetch accounts:', err);
                setError('We could not load your schools. Please try again.');
            } finally {
                setIsLoadingAccounts(false);
            }
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, [userId, apiClient, accounts.length, setAuthAccounts, activeStep, localSelectedRole]);

    useEffect(() => {
        const fetchSchools = async () => {
            if (localSelectedAccount && activeStep === 2) {
                const account = accounts.find((a) => a.id === localSelectedAccount);
                if (account && account.branches.length === 0) {
                    setIsLoadingSchools(true);
                    setError(null);
                    try {
                        const response = await apiClient.getDefaultSchools(localSelectedAccount);
                        const fetchedSchools = response.regularSchools.map((school) => ({
                            id: school.id,
                            name: school.name,
                            branches: school.locations,
                            isDefault: school.isDefault,
                        }));
                        setSchools(fetchedSchools);

                        const updatedAccounts = accounts.map((a) =>
                            a.id === localSelectedAccount
                                ? { ...a, branches: fetchedSchools.flatMap((s) => s.branches) }
                                : a,
                        );
                        setAuthAccounts(updatedAccounts);

                        const defaultSchool = fetchedSchools.find((s) => s.isDefault);
                        if (defaultSchool && defaultSchool.branches.length > 0) {
                            setLocalSelectedBranches(defaultSchool.branches[0]);
                        }
                    } catch (err) {
                        console.error('Failed to fetch schools:', err);
                        setError('We could not load your branches. Please try again.');
                    } finally {
                        setIsLoadingSchools(false);
                    }
                }
            }
        };
        fetchSchools();
    }, [localSelectedAccount, activeStep, accounts, apiClient, setAuthAccounts]);

    const selectedAccountData = useMemo(
        () => accounts.find((account) => account.id === localSelectedAccount),
        [accounts, localSelectedAccount],
    );

    const handleRoleChange = (event: any) => {
        setLocalSelectedRole(event.target.value);
        localStorage.setItem('selectedRole', event.target.value);
        setActiveStep(1);
    };

    const handleAccountChange = (event: any) => {
        setLocalSelectedAccount(event.target.value);
        setLocalSelectedBranches(null);
        setActiveStep(2);
    };

    const handleBranchChange = (event: any) => {
        const selectedId = event.target.value as string;
        const selected =
            selectedAccountData?.branches.find((branch) => branch.id === selectedId) || null;
        setLocalSelectedBranches(selected);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
        if (activeStep === 2) {
            setLocalSelectedBranches(null);
        }
    };

    const handleSubmit = () => {
        if (localSelectedAccount && localSelectedBranches) {
            setAccountSelection(localSelectedAccount, [localSelectedBranches]);

            // 🎯 Land on the first page this role can actually see
            const landingPath = getFirstRouteForRole(localSelectedRole);

            navigate(landingPath, { replace: true });
        }
    };

    // ── Reusable select styling ────────────────────────────────────────────
    const selectStyles = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '14px',
            bgcolor: alpha(theme.palette.background.default, 0.7),
            transition: 'all 0.25s ease',
            '& fieldset': {
                borderColor: alpha(theme.palette.text.primary, 0.15),
            },
            '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
            },
            '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
                borderWidth: 2,
            },
            '&.Mui-focused': {
                boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.15)}`,
            },
        },
        '& .MuiInputLabel-root': {
            fontWeight: 500,
            '&.Mui-focused': {
                color: theme.palette.primary.main,
            },
        },
    };

    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <FormControl fullWidth sx={{ mb: 3, ...selectStyles }}>
                        <InputLabel id="role-select-label">Your role</InputLabel>
                        <Select
                            labelId="role-select-label"
                            id="role-select"
                            value={localSelectedRole}
                            onChange={handleRoleChange}
                            input={<OutlinedInput label="Your role" />}
                            MenuProps={{
                                PaperProps: {
                                    sx: { borderRadius: 2, mt: 1 },
                                },
                            }}
                        >
                            {availableRoles.map((role) => (
                                <MenuItem key={role} value={role}>
                                    {role}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );

            case 1:
                return (
                    <FormControl fullWidth sx={{ mb: 3, ...selectStyles }}>
                        <InputLabel id="account-select-label">Your school</InputLabel>
                        <Select
                            labelId="account-select-label"
                            id="account-select"
                            value={localSelectedAccount}
                            onChange={handleAccountChange}
                            input={<OutlinedInput label="Your school" />}
                            disabled={isLoadingAccounts || accounts.length === 0}
                            MenuProps={{
                                PaperProps: {
                                    sx: { borderRadius: 2, mt: 1 },
                                },
                            }}
                            endAdornment={
                                isLoadingAccounts ? (
                                    <CircularProgress
                                        size={18}
                                        sx={{ mr: 3, color: theme.palette.primary.main }}
                                    />
                                ) : null
                            }
                        >
                            {accounts.map((account) => (
                                <MenuItem key={account.id} value={account.id}>
                                    {account.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {isLoadingAccounts && (
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ mt: 1, ml: 1.5 }}
                            >
                                Loading your schools...
                            </Typography>
                        )}
                    </FormControl>
                );

            case 2:
                return (
                    <>
                        <Stack
                            direction="row"
                            spacing={1}
                            flexWrap="wrap"
                            useFlexGap
                            sx={{ mb: 2.5 }}
                        >
                            {localSelectedRole && (
                                <Box
                                    sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 0.75,
                                        px: 1.5,
                                        py: 0.6,
                                        borderRadius: 99,
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        color: theme.palette.primary.main,
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    <IconifyIcon icon="mdi:account-tie" width={14} />
                                    {localSelectedRole}
                                </Box>
                            )}
                            {selectedAccountData?.name && (
                                <Box
                                    sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 0.75,
                                        px: 1.5,
                                        py: 0.6,
                                        borderRadius: 99,
                                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                        color: theme.palette.secondary.main,
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    <IconifyIcon icon="mdi:school-outline" width={14} />
                                    {selectedAccountData.name}
                                </Box>
                            )}
                        </Stack>

                        <FormControl fullWidth sx={{ mb: 3, ...selectStyles }}>
                            <InputLabel id="branch-select-label">Your branch</InputLabel>
                            <Select
                                labelId="branch-select-label"
                                id="branch-select"
                                value={localSelectedBranches?.id || ''}
                                onChange={handleBranchChange}
                                input={<OutlinedInput label="Your branch" />}
                                disabled={isLoadingSchools}
                                MenuProps={{
                                    PaperProps: {
                                        sx: { borderRadius: 2, mt: 1 },
                                    },
                                }}
                                endAdornment={
                                    isLoadingSchools ? (
                                        <CircularProgress
                                            size={18}
                                            sx={{ mr: 3, color: theme.palette.primary.main }}
                                        />
                                    ) : null
                                }
                            >
                                {selectedAccountData?.branches.map((branch) => (
                                    <MenuItem key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            {isLoadingSchools && (
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ mt: 1, ml: 1.5 }}
                                >
                                    Loading your branches...
                                </Typography>
                            )}
                        </FormControl>
                    </>
                );

            default:
                return null;
        }
    };

    const isNextDisabled =
        (activeStep === 0 && !localSelectedRole) ||
        (activeStep === 1 && !localSelectedAccount) ||
        (activeStep === 2 && !localSelectedBranches) ||
        isLoadingAccounts ||
        isLoadingSchools;

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                position: 'relative',
                overflow: 'hidden',
                // ✅ Now using theme background.default
                bgcolor: theme.palette.background.default,
                p: { xs: 2, sm: 3 },

                // Soft brand-tinted glows (kept subtle so background.default shows through)
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '-15%',
                    right: '-10%',
                    width: { xs: 260, sm: 380, md: 500 },
                    height: { xs: 260, sm: 380, md: 500 },
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(
                        theme.palette.primary.light,
                        0.18,
                    )} 0%, transparent 70%)`,
                    pointerEvents: 'none',
                    animation: 'float 8s ease-in-out infinite',
                    '@keyframes float': {
                        '0%,100%': { transform: 'translateY(0px)' },
                        '50%': { transform: 'translateY(25px)' },
                    },
                },
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '-15%',
                    left: '-10%',
                    width: { xs: 240, sm: 340, md: 460 },
                    height: { xs: 240, sm: 340, md: 460 },
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(
                        theme.palette.secondary.light,
                        0.15,
                    )} 0%, transparent 70%)`,
                    pointerEvents: 'none',
                    animation: 'float2 10s ease-in-out infinite',
                    '@keyframes float2': {
                        '0%,100%': { transform: 'translateY(0px)' },
                        '50%': { transform: 'translateY(-25px)' },
                    },
                },
            }}
        >
            <Modal
                open={true}
                aria-labelledby="account-selection-modal"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(4px)',
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        zIndex: 1,
                        // Card uses a subtle contrast against background.default
                        backgroundColor: alpha(theme.palette.common.white, 0.75),
                        backdropFilter: 'blur(24px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                        borderRadius: { xs: 3, sm: 4, md: 5 },
                        border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
                        boxShadow: `0 25px 60px ${alpha('#000', 0.15)}`,
                        p: { xs: 3, sm: 4, md: 5 },
                        width: '100%',
                        maxWidth: 520,
                        mx: 2,
                        outline: 'none',

                        // Load animation
                        opacity: mounted ? 1 : 0,
                        transform: mounted
                            ? 'translateY(0) scale(1)'
                            : 'translateY(30px) scale(0.96)',
                        transition: 'opacity 0.5s ease, transform 0.5s ease',

                        // Animated top bar
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            borderTopLeftRadius: 'inherit',
                            borderTopRightRadius: 'inherit',
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 4s linear infinite',
                            '@keyframes shimmer': {
                                '0%': { backgroundPosition: '0% 0%' },
                                '100%': { backgroundPosition: '200% 0%' },
                            },
                        },
                    }}
                >
                    {/* ── Header ──────────────────────────────────────── */}
                    <Box
                        textAlign="center"
                        mb={{ xs: 3, sm: 4 }}
                        sx={{
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                            transition:
                                'opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s',
                        }}
                    >
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                borderRadius: '50%',
                                mx: 'auto',
                                mb: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                boxShadow: `0 12px 30px ${alpha(
                                    theme.palette.primary.main,
                                    0.35,
                                )}`,
                            }}
                        >
                            <IconifyIcon
                                icon="mdi:school-outline"
                                color={theme.palette.common.white}
                                width={28}
                            />
                        </Box>

                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 800,
                                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 0.5,
                            }}
                        >
                            {STEP_TITLES[activeStep]}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                maxWidth: 340,
                                mx: 'auto',
                            }}
                        >
                            {STEP_SUBTITLES[activeStep]}
                        </Typography>
                    </Box>

                    {/* ── Stepper ─────────────────────────────────────── */}
                    <Stepper
                        activeStep={activeStep}
                        alternativeLabel={isMobile}
                        sx={{
                            mb: { xs: 3, sm: 4 },
                            opacity: mounted ? 1 : 0,
                            transition: 'opacity 0.5s ease 0.25s',
                            '& .MuiStepLabel-label': {
                                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                fontWeight: 600,
                                mt: { xs: 0.5, sm: 1 },
                            },
                            '& .MuiStepIcon-root': {
                                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                                '&.Mui-active': {
                                    color: theme.palette.primary.main,
                                },
                                '&.Mui-completed': {
                                    color: theme.palette.success.main,
                                },
                            },
                        }}
                    >
                        {STEP_LABELS.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {/* ── Error ───────────────────────────────────────── */}
                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 2,
                                borderRadius: 2,
                                fontSize: '0.85rem',
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    {/* ── Step content ────────────────────────────────── */}
                    <Box
                        sx={{
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                            transition:
                                'opacity 0.5s ease 0.35s, transform 0.5s ease 0.35s',
                        }}
                    >
                        {getStepContent(activeStep)}
                    </Box>

                    {/* ── Actions ─────────────────────────────────────── */}
                    <Stack
                        direction={{ xs: 'column-reverse', sm: 'row' }}
                        justifyContent="space-between"
                        gap={2}
                        sx={{
                            mt: 2,
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                            transition:
                                'opacity 0.5s ease 0.45s, transform 0.5s ease 0.45s',
                        }}
                    >
                        <Button
                            variant="outlined"
                            onClick={activeStep === 0 ? () => navigate(-1) : handleBack}
                            disabled={isLoadingAccounts || isLoadingSchools || activeStep === 0}
                            startIcon={<IconifyIcon icon="mdi:arrow-left" width={18} />}
                            sx={{
                                minWidth: { xs: '100%', sm: 120 },
                                py: 1.1,
                                borderRadius: '12px',
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: { xs: '0.875rem', sm: '0.95rem' },
                                borderColor: alpha(theme.palette.text.primary, 0.15),
                                color: theme.palette.text.secondary,
                                transition: 'all 0.25s ease',
                                '&:hover': {
                                    borderColor: theme.palette.primary.main,
                                    color: theme.palette.primary.main,
                                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                                    transform: 'translateY(-2px)',
                                },
                            }}
                        >
                            {activeStep === 0 ? 'Cancel' : 'Back'}
                        </Button>

                        <Button
                            variant="contained"
                            onClick={
                                activeStep === 0
                                    ? () => localSelectedRole && setActiveStep(1)
                                    : activeStep === 1
                                        ? () => localSelectedAccount && setActiveStep(2)
                                        : handleSubmit
                            }
                            disabled={isNextDisabled}
                            endIcon={
                                activeStep === 2 ? (
                                    <IconifyIcon icon="mdi:check" width={18} />
                                ) : (
                                    <IconifyIcon icon="mdi:arrow-right" width={18} />
                                )
                            }
                            sx={{
                                minWidth: { xs: '100%', sm: 130 },
                                py: 1.1,
                                borderRadius: '12px',
                                fontWeight: 700,
                                textTransform: 'none',
                                fontSize: { xs: '0.875rem', sm: '0.95rem' },
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                boxShadow: `0 10px 30px ${alpha(
                                    theme.palette.primary.main,
                                    0.35,
                                )}`,
                                transition: 'all 0.25s ease',
                                '&:hover': {
                                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 14px 36px ${alpha(
                                        theme.palette.primary.main,
                                        0.5,
                                    )}`,
                                },
                                '&:active': { transform: 'translateY(0)' },
                                '&.Mui-disabled': {
                                    background: alpha(theme.palette.text.disabled, 0.12),
                                    color: alpha(theme.palette.text.primary, 0.4),
                                    boxShadow: 'none',
                                },
                            }}
                        >
                            {activeStep === 2 ? 'Continue' : 'Next'}
                        </Button>
                    </Stack>
                </Box>
            </Modal>
        </Box>
    );
};

export default AccountSelectionPage;
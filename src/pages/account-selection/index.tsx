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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context';
import { type LocationModel } from '../../utils/apiClient';
import { fetchAndStoreAllEnums, getEnum } from '../../api/enumsApi';

const AccountSelectionPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const {
        selectedAccount,
        selectedBranches,
        setAccountSelection,
        accounts,
        userId,
        apiClient,
        accessToken,
        setAccounts: setAuthAccounts
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
                const roles = decodedPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

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
                    pageLength: 100
                });
                const fetchedAccounts = response.items.map((account: any) => ({
                    id: String(account.id),
                    name: account.name,
                    branches: [] as LocationModel[]
                }));
                setAuthAccounts(fetchedAccounts);
            } catch (err) {
                console.error('Failed to fetch accounts:', err);
                setError('Failed to load accounts. Please try again later.');
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
                const account = accounts.find(a => a.id === localSelectedAccount);
                if (account && account.branches.length === 0) {
                    setIsLoadingSchools(true);
                    setError(null);
                    try {
                        const response = await apiClient.getDefaultSchools(localSelectedAccount);
                        const fetchedSchools = response.regularSchools.map(school => ({
                            id: school.id,
                            name: school.name,
                            branches: school.locations,
                            isDefault: school.isDefault
                        }));
                        setSchools(fetchedSchools);

                        const updatedAccounts = accounts.map(a =>
                            a.id === localSelectedAccount
                                ? { ...a, branches: fetchedSchools.flatMap(s => s.branches) }
                                : a
                        );
                        setAuthAccounts(updatedAccounts);

                        const defaultSchool = fetchedSchools.find(s => s.isDefault);
                        if (defaultSchool && defaultSchool.branches.length > 0) {
                            setLocalSelectedBranches(defaultSchool.branches[0]);
                        }
                    } catch (err) {
                        console.error('Failed to fetch schools:', err);
                        setError('Failed to load schools. Please try again later.');
                    } finally {
                        setIsLoadingSchools(false);
                    }
                }
            }
        };
        fetchSchools();
    }, [localSelectedAccount, activeStep, accounts, apiClient, setAuthAccounts]);

    const selectedAccountData = useMemo(() =>
        accounts.find(account => account.id === localSelectedAccount),
        [accounts, localSelectedAccount]
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
        const selected = selectedAccountData?.branches.find(branch => branch.id === selectedId) || null;
        setLocalSelectedBranches(selected);
    };

    const handleBack = () => {
        setActiveStep(prev => prev - 1);
        if (activeStep === 2) {
            setLocalSelectedBranches(null);
        }
    };

    const handleSubmit = () => {
        if (localSelectedAccount && localSelectedBranches) {
            setAccountSelection(localSelectedAccount, [localSelectedBranches]);
            navigate('/app/welcome', { replace: true });
        }
    };

    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel id="role-select-label">Select Role</InputLabel>
                        <Select
                            labelId="role-select-label"
                            id="role-select"
                            value={localSelectedRole}
                            onChange={handleRoleChange}
                            input={<OutlinedInput label="Select Role" />}
                            sx={{ bgcolor: theme.palette.background.default }}
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
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel id="account-select-label">Account</InputLabel>
                        <Select
                            labelId="account-select-label"
                            id="account-select"
                            value={localSelectedAccount}
                            onChange={handleAccountChange}
                            input={<OutlinedInput label="Account" />}
                            sx={{ bgcolor: theme.palette.background.default }}
                            disabled={isLoadingAccounts || accounts.length === 0}
                        >
                            {accounts.map((account) => (
                                <MenuItem key={account.id} value={account.id}>
                                    {account.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            case 2:
                return (
                    <>
                        <Typography variant="body1" mb={2}>
                            Selected Account: <strong>{selectedAccountData?.name}</strong>
                        </Typography>
                        <Typography variant="body1" mb={2}>
                            Selected Role: <strong>{localSelectedRole}</strong>
                        </Typography>
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel id="branch-select-label">Branch</InputLabel>
                            <Select
                                labelId="branch-select-label"
                                id="branch-select"
                                value={localSelectedBranches?.id || ''}
                                onChange={handleBranchChange}
                                input={<OutlinedInput label="Branch" />}
                                disabled={isLoadingSchools}
                            >
                                {selectedAccountData?.branches.map((branch) => (
                                    <MenuItem key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.background.default} 100%)`,
                p: 2,
            }}
        >
            <Modal
                open={true}
                aria-labelledby="account-selection-modal"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Box
                    sx={{
                        backgroundColor: theme.palette.background.default,
                        borderRadius: 2,
                        boxShadow: 24,
                        p: 4,
                        width: '100%',
                        maxWidth: 500,
                        outline: 'none',
                    }}
                >
                    <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                        <Step>
                            <StepLabel>Select Role</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Select School Account</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Select School Branch</StepLabel>
                        </Step>
                    </Stepper>

                    <Typography variant="h5" component="h6" gutterBottom textAlign="center">
                        {activeStep === 0 ? 'Select Your Role' :
                            activeStep === 1 ? 'Select Your School Account' :
                                'Select Your School Branch'}
                    </Typography>

                    {error && (
                        <Typography color="error" textAlign="center" mb={2}>
                            {error}
                        </Typography>
                    )}

                    {getStepContent(activeStep)}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={activeStep === 0 ? () => navigate(-1) : handleBack}
                            disabled={isLoadingAccounts || isLoadingSchools || activeStep === 0}
                        >
                            {activeStep === 0 ? 'Cancel' : 'Back'}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={
                                activeStep === 0 ? () => localSelectedRole && setActiveStep(1) :
                                    activeStep === 1 ? () => localSelectedAccount && setActiveStep(2) :
                                        handleSubmit
                            }
                            disabled={
                                (activeStep === 0 && !localSelectedRole) ||
                                (activeStep === 1 && !localSelectedAccount) ||
                                (activeStep === 2 && !localSelectedBranches) ||
                                isLoadingAccounts ||
                                isLoadingSchools
                            }
                        >
                            {activeStep === 2 ? 'Continue' : 'Next'}
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};

export default AccountSelectionPage;
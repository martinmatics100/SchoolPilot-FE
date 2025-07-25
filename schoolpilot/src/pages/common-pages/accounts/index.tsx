// src/pages/account-selection/index.tsx

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
    Chip,
    ListItemText,
    Checkbox,
    useTheme,
    Stepper,
    Step,
    StepLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context';
import { type LocationModel } from '../../../utils/apiClient';
import { fetchAndStoreAllEnums, getEnum } from '../../../api/enumsApi';

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
        setAccounts: setAuthAccounts
    } = useAuth();

    const [localSelectedAccount, setLocalSelectedAccount] = useState(selectedAccount || '');
    const [localSelectedBranches, setLocalSelectedBranches] = useState<LocationModel[]>(selectedBranches || []);
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
        const fetchAccounts = async () => {
            if (userId && accounts.length === 0) {
                setIsLoadingAccounts(true);
                setError(null);
                try {
                    const response = await apiClient.getAccounts(userId, 1, 100);
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
        fetchAccounts();
    }, [userId, apiClient, accounts.length, setAuthAccounts]);

    useEffect(() => {
        const fetchSchools = async () => {
            if (localSelectedAccount && activeStep === 1) {
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
                        if (defaultSchool) {
                            setLocalSelectedBranches(defaultSchool.branches);
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

    const handleAccountChange = (event: any) => {
        setLocalSelectedAccount(event.target.value);
        setActiveStep(1);
    };

    const handleBranchChange = (event: any) => {
        const selectedIds = event.target.value as string[];
        const selected = selectedAccountData?.branches.filter(branch =>
            selectedIds.includes(branch.id)
        ) || [];
        setLocalSelectedBranches(selected);
    };

    const handleBack = () => {
        setActiveStep(0);
        setLocalSelectedBranches([]);
    };

    const handleSubmit = () => {
        if (localSelectedAccount && localSelectedBranches.length > 0) {
            setAccountSelection(localSelectedAccount, localSelectedBranches);
            navigate('/app/dashboard', { replace: true });
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
                            <StepLabel>Select School Account</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Select School Branches</StepLabel>
                        </Step>
                    </Stepper>

                    <Typography variant="h5" component="h6" gutterBottom textAlign="center">
                        {activeStep === 0 ? 'Select Your School Account' : 'Select your School branch Branch(es)'}
                    </Typography>

                    {error && (
                        <Typography color="error" textAlign="center" mb={2}>
                            {error}
                        </Typography>
                    )}

                    {activeStep === 0 ? (
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
                    ) : (
                        <>
                            <Typography variant="body1" mb={2}>
                                Selected Account: <strong>{selectedAccountData?.name}</strong>
                            </Typography>

                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel id="branch-select-label">Branches</InputLabel>
                                <Select
                                    labelId="branch-select-label"
                                    id="branch-select"
                                    multiple
                                    value={localSelectedBranches.map(b => b.id)}
                                    onChange={handleBranchChange}
                                    input={<OutlinedInput label="Branches" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((id: string) => {
                                                const branch = selectedAccountData?.branches.find(b => b.id === id);
                                                return <Chip key={id} label={branch?.name} />;
                                            })}
                                        </Box>
                                    )}
                                    disabled={isLoadingSchools}
                                >
                                    {selectedAccountData?.branches.map((branch) => (
                                        <MenuItem key={branch.id} value={branch.id}>
                                            <Checkbox checked={localSelectedBranches.some(b => b.id === branch.id)} />
                                            <ListItemText primary={branch.name} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={activeStep === 0 ? () => navigate(-1) : handleBack}
                            disabled={isLoadingAccounts || isLoadingSchools}
                        >
                            {activeStep === 0 ? 'Cancel' : 'Back'}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={activeStep === 0 ? () => setActiveStep(1) : handleSubmit}
                            disabled={
                                (activeStep === 0 && !localSelectedAccount) ||
                                (activeStep === 1 && localSelectedBranches.length === 0) ||
                                isLoadingAccounts ||
                                isLoadingSchools
                            }
                        >
                            {activeStep === 0 ? 'Next' : 'Continue'}
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};

export default AccountSelectionPage;
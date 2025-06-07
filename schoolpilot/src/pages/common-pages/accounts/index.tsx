// src/pages/account-selection/index.tsx
import React, { useState } from 'react';
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context';

const AccountSelectionPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const {
        selectedAccount,
        selectedBranches,
        setAccountSelection,
        accounts
    } = useAuth();

    const [localSelectedAccount, setLocalSelectedAccount] = useState(selectedAccount || '');
    const [localSelectedBranches, setLocalSelectedBranches] = useState<string[]>(selectedBranches || []);

    const handleAccountChange = (event: any) => {
        setLocalSelectedAccount(event.target.value);
        setLocalSelectedBranches([]); // Reset branches when account changes
    };

    const handleBranchChange = (event: any) => {
        const value = event.target.value;
        setLocalSelectedBranches(typeof value === 'string' ? value.split(',') : value);
    };

    const handleSubmit = () => {
        if (localSelectedAccount && localSelectedBranches.length > 0) {
            setAccountSelection(localSelectedAccount, localSelectedBranches);
            navigate('/app/dashboard', { replace: true });
        }
    };

    const selectedAccountData = accounts.find(account => account.id === localSelectedAccount);

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
                    <Typography variant="h5" component="h6" gutterBottom textAlign="center">
                        Select Your School Account
                    </Typography>

                    <Typography variant="body1" color="text.secondary" mb={3} textAlign="center">
                        Choose your school account and branch(es) to access SchoolPilot
                    </Typography>

                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel id="account-select-label">School Account</InputLabel>
                        <Select
                            labelId="account-select-label"
                            id="account-select"
                            value={localSelectedAccount}
                            onChange={handleAccountChange}
                            input={<OutlinedInput label="School Account" />}
                            sx={{ bgcolor: theme.palette.background.default }}
                        >
                            {accounts.map((account) => (
                                <MenuItem key={account.id} value={account.id} >
                                    {account.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {localSelectedAccount && (
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel id="branch-select-label">Branches</InputLabel>
                            <Select
                                labelId="branch-select-label"
                                id="branch-select"
                                multiple
                                value={localSelectedBranches}
                                onChange={handleBranchChange}
                                input={<OutlinedInput label="Branches" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} />
                                        ))}
                                    </Box>
                                )}
                            >
                                {selectedAccountData?.branches.map((branch) => (
                                    <MenuItem key={branch} value={branch}>
                                        <Checkbox checked={localSelectedBranches.indexOf(branch) > -1} />
                                        <ListItemText primary={branch} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={handleSubmit}
                        disabled={!localSelectedAccount || localSelectedBranches.length === 0}
                        sx={{ mt: 2 }}
                    >
                        Go to SchoolPilot
                    </Button>
                </Box>
            </Modal>
        </Box>
    );
};

export default AccountSelectionPage;
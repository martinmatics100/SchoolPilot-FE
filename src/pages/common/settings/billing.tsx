import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Stack,
    Divider,
    Chip,
    Paper,
    alpha,
    useTheme,
    IconButton,
    Tooltip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tab,
    Switch,
    FormControlLabel,
} from '@mui/material';
import IconifyIcon from '../../../components/base/iconifyIcon';

// Tab Panel component
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`billing-tabpanel-${index}`}
            aria-labelledby={`billing-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
};

const BillingSettings = () => {
    const theme = useTheme();
    const [tabValue, setTabValue] = useState(0);
    const [autoRenew, setAutoRenew] = useState(true);

    // Mock data
    const currentPlan = {
        name: 'School Pro',
        price: '$49',
        period: '/month',
        users: 'Unlimited',
        storage: '100 GB',
        features: [
            'Unlimited students & teachers',
            'Advanced reporting',
            'Parent portal access',
            '24/7 priority support',
            'Custom branding',
            'API access',
        ],
        nextBilling: 'August 15, 2026',
        status: 'Active',
    };

    const billingHistory = [
        { id: 1, date: 'July 15, 2026', amount: '$49.00', status: 'Paid', invoice: 'INV-001' },
        { id: 2, date: 'June 15, 2026', amount: '$49.00', status: 'Paid', invoice: 'INV-002' },
        { id: 3, date: 'May 15, 2026', amount: '$49.00', status: 'Paid', invoice: 'INV-003' },
        { id: 4, date: 'April 15, 2026', amount: '$49.00', status: 'Failed', invoice: 'INV-004' },
    ];

    const paymentMethods = [
        { id: 1, type: 'Visa', last4: '4242', expiry: '12/26', isDefault: true },
        { id: 2, type: 'Mastercard', last4: '8888', expiry: '08/25', isDefault: false },
    ];

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <IconifyIcon
                            icon="mdi:credit-card-outline"
                            width={24}
                            color={theme.palette.primary.main}
                        />
                    </Box>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                            fontSize: { xs: '1.25rem', sm: '1.5rem' },
                        }}
                    >
                        Billing & Subscription
                    </Typography>
                </Box>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ml: 7, fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                    Manage your billing and subscription
                </Typography>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            minWidth: 'auto',
                            px: 3,
                        },
                        '& .Mui-selected': {
                            color: theme.palette.primary.main,
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: theme.palette.primary.main,
                        },
                    }}
                >
                    <Tab label="Overview" icon={<IconifyIcon icon="mdi:home-outline" width={20} />} iconPosition="start" />
                    <Tab label="Billing History" icon={<IconifyIcon icon="mdi:history" width={20} />} iconPosition="start" />
                    <Tab label="Payment Methods" icon={<IconifyIcon icon="mdi:credit-card-outline" width={20} />} iconPosition="start" />
                </Tabs>
            </Box>

            {/* Tab Panels */}
            <TabPanel value={tabValue} index={0}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                    {/* Current Plan Card - Left Side */}
                    <Box sx={{ flex: { md: 2 } }}>
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 3,
                                bgcolor: theme.palette.background.default,
                                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                                overflow: 'hidden',
                            }}
                        >
                            <Box
                                sx={{
                                    p: 3,
                                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                                }}
                            >
                                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                                            Current Plan
                                        </Typography>
                                        <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
                                            {currentPlan.name}
                                        </Typography>
                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                                            <Typography variant="h5" fontWeight={700} color="primary.main">
                                                {currentPlan.price}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {currentPlan.period}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                    <Chip
                                        label={currentPlan.status}
                                        color="success"
                                        size="medium"
                                        icon={<IconifyIcon icon="mdi:check-circle" width={18} />}
                                        sx={{
                                            fontWeight: 600,
                                            px: 1,
                                        }}
                                    />
                                </Stack>
                            </Box>

                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                                    Plan Features
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {currentPlan.features.map((feature, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                width: { xs: '100%', sm: 'calc(50% - 8px)' },
                                            }}
                                        >
                                            <IconifyIcon
                                                icon="mdi:check-circle-outline"
                                                width={18}
                                                color={theme.palette.success.main}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                {feature}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>

                                <Divider sx={{ my: 3 }} />

                                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Next Billing Date
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            {currentPlan.nextBilling}
                                        </Typography>
                                    </Box>
                                    <Stack direction="row" spacing={2}>
                                        <Button
                                            variant="outlined"
                                            startIcon={<IconifyIcon icon="mdi:pencil-outline" width={18} />}
                                            sx={{ borderRadius: 2, textTransform: 'none' }}
                                        >
                                            Change Plan
                                        </Button>
                                        <Button
                                            variant="contained"
                                            startIcon={<IconifyIcon icon="mdi:refresh" width={18} />}
                                            sx={{
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                            }}
                                        >
                                            Upgrade
                                        </Button>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Box>

                    {/* Quick Stats - Right Side */}
                    <Box sx={{ flex: { md: 1 } }}>
                        <Stack spacing={3}>
                            <Card
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    bgcolor: theme.palette.background.default,
                                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                                }}
                            >
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 2,
                                            bgcolor: alpha(theme.palette.info.main, 0.1),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <IconifyIcon icon="mdi:users" width={24} color={theme.palette.info.main} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Users
                                        </Typography>
                                        <Typography variant="h6" fontWeight={700}>
                                            {currentPlan.users}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Card>

                            <Card
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    bgcolor: theme.palette.background.default,
                                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                                }}
                            >
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 2,
                                            bgcolor: alpha(theme.palette.success.main, 0.1),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <IconifyIcon icon="mdi:database" width={24} color={theme.palette.success.main} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Storage
                                        </Typography>
                                        <Typography variant="h6" fontWeight={700}>
                                            {currentPlan.storage}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Card>

                            <Card
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    bgcolor: theme.palette.background.default,
                                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                                }}
                            >
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={autoRenew}
                                            onChange={(e) => setAutoRenew(e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="body2" fontWeight={600}>
                                                Auto-Renew
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {autoRenew ? 'Enabled' : 'Disabled'}
                                            </Typography>
                                        </Box>
                                    }
                                    sx={{ m: 0 }}
                                />
                            </Card>
                        </Stack>
                    </Box>
                </Stack>
            </TabPanel>

            {/* Billing History Tab */}
            <TabPanel value={tabValue} index={1}>
                <Card
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        bgcolor: theme.palette.background.default,
                        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                        overflow: 'hidden',
                    }}
                >
                    <Box sx={{ p: 3, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                            <Box>
                                <Typography variant="h6" fontWeight={600}>
                                    Billing History
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    View all your past invoices and payments
                                </Typography>
                            </Box>
                            <Button
                                variant="outlined"
                                startIcon={<IconifyIcon icon="mdi:download-outline" width={18} />}
                                sx={{ borderRadius: 2, textTransform: 'none' }}
                            >
                                Download All
                            </Button>
                        </Stack>
                    </Box>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Invoice</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {billingHistory.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={500}>
                                                {item.invoice}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {item.date}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>
                                                {item.amount}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={item.status}
                                                size="small"
                                                color={item.status === 'Paid' ? 'success' : 'error'}
                                                sx={{ fontWeight: 500, fontSize: '0.7rem' }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Download Invoice">
                                                <IconButton size="small">
                                                    <IconifyIcon icon="mdi:download-outline" width={18} />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </TabPanel>

            {/* Payment Methods Tab */}
            <TabPanel value={tabValue} index={2}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {paymentMethods.map((method) => (
                        <Box
                            key={method.id}
                            sx={{
                                width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.33% - 16px)' },
                                minWidth: { xs: '100%', sm: '250px' },
                            }}
                        >
                            <Card
                                elevation={0}
                                sx={{
                                    borderRadius: 3,
                                    bgcolor: theme.palette.background.default,
                                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                                    p: 3,
                                    position: 'relative',
                                    height: '100%',
                                }}
                            >
                                {method.isDefault && (
                                    <Chip
                                        label="Default"
                                        size="small"
                                        color="primary"
                                        sx={{
                                            position: 'absolute',
                                            top: 12,
                                            right: 12,
                                            fontWeight: 600,
                                            fontSize: '0.65rem',
                                        }}
                                    />
                                )}
                                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 32,
                                            borderRadius: 1,
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <IconifyIcon
                                            icon={method.type === 'Visa' ? 'mdi:credit-card' : 'mdi:credit-card-multiple'}
                                            width={28}
                                            color={theme.palette.primary.main}
                                        />
                                    </Box>
                                    <Box>
                                        <Typography variant="body1" fontWeight={600}>
                                            {method.type}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            •••• {method.last4}
                                        </Typography>
                                    </Box>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.secondary">
                                        Expires: {method.expiry}
                                    </Typography>
                                    <Stack direction="row" spacing={1}>
                                        <Tooltip title="Edit">
                                            <IconButton size="small">
                                                <IconifyIcon icon="mdi:pencil-outline" width={18} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Remove">
                                            <IconButton size="small" color="error">
                                                <IconifyIcon icon="mdi:delete-outline" width={18} />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </Stack>
                            </Card>
                        </Box>
                    ))}

                    {/* Add New Payment Method */}
                    <Box
                        sx={{
                            width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.33% - 16px)' },
                            minWidth: { xs: '100%', sm: '250px' },
                        }}
                    >
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 3,
                                bgcolor: theme.palette.background.default,
                                border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
                                p: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: 180,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                height: '100%',
                                '&:hover': {
                                    borderColor: theme.palette.primary.main,
                                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                                },
                            }}
                        >
                            <IconifyIcon
                                icon="mdi:plus-circle-outline"
                                width={40}
                                color={theme.palette.text.disabled}
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Add New Payment Method
                            </Typography>
                        </Card>
                    </Box>
                </Box>
            </TabPanel>
        </Box>
    );
};

export default BillingSettings;
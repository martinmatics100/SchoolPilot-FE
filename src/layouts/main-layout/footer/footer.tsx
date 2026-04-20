// src/layouts/main-layout/footer/footer.tsx
import { Stack, Typography, type StackProps, Chip, Tooltip, alpha } from '@mui/material';
import { useBreakpoints } from '../../../providers/breakPointsProvider';
import { type ReactElement } from 'react';
import { useTheme } from '@mui/material';
import IconifyIcon from '../../../components/base/iconifyIcon';

interface FooterProps extends StackProps {
    open: boolean;
}

export const Footer = ({ open, ...rest }: FooterProps): ReactElement => {
    const { down } = useBreakpoints();
    const isMobileScreen = down('sm');
    const theme = useTheme();
    const year = new Date().getFullYear();
    const version = "1.0.2738";
    const environment = "Production";

    // Release information
    const releaseDate = "2025-01-15"; // YYYY-MM-DD format
    const releaseTime = "14:30:00 UTC"; // Time with timezone
    const formattedReleaseDate = new Date(releaseDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <Stack
            component="footer"
            direction={isMobileScreen ? 'column' : 'row'}
            alignItems="center"
            justifyContent="center"
            spacing={isMobileScreen ? 0.5 : 2}
            sx={{
                backgroundColor: alpha(theme.palette.background.default, 0.95),
                backdropFilter: 'blur(8px)',
                borderTop: `1px solid ${theme.palette.divider}`,
                py: isMobileScreen ? 1 : 1.2,
                px: open ? 3 : 2,
                width: '100%',
                transition: 'all 0.3s ease',
                zIndex: (theme) => theme.zIndex.appBar + 10,
                ...rest.sx,
            }}
            {...rest}
        >
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" justifyContent="center">
                <IconifyIcon
                    icon="solar:atom-bold"
                    width={14}
                    height={14}
                    sx={{ color: theme.palette.primary.main }}
                />
                <Typography
                    variant="caption"
                    sx={{
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        color: theme.palette.text.secondary,
                    }}
                >
                    SchoolPilot © {year}
                </Typography>

                <Typography variant="caption" sx={{ color: theme.palette.divider }}>
                    |
                </Typography>

                {/* Version with Tooltip */}
                <Tooltip
                    title={
                        <Stack spacing={0.5} sx={{ p: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                Release Information
                            </Typography>
                            <Typography variant="caption">
                                📅 Date: {formattedReleaseDate}
                            </Typography>
                            <Typography variant="caption">
                                ⏰ Time: {releaseTime}
                            </Typography>
                        </Stack>
                    }
                    arrow
                    placement="top"
                    componentsProps={{
                        tooltip: {
                            sx: {
                                bgcolor: theme.palette.background.paper,
                                color: theme.palette.text.primary,
                                boxShadow: theme.shadows[4],
                                border: `1px solid ${theme.palette.divider}`,
                                py: 1,
                                px: 1.5,
                                maxWidth: 220,
                            }
                        }
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            fontSize: '0.7rem',
                            fontFamily: 'monospace',
                            color: theme.palette.text.secondary,
                            cursor: 'help',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                color: theme.palette.primary.main,
                                transform: 'scale(1.05)',
                            },
                        }}
                    >
                        {version}
                    </Typography>
                </Tooltip>

                <Typography variant="caption" sx={{ color: theme.palette.divider }}>
                    |
                </Typography>

                {/* Environment Chip with Tooltip */}
                <Tooltip
                    title={`Running in ${environment} environment`}
                    arrow
                    placement="top"
                >
                    <Chip
                        size="small"
                        label={environment}
                        sx={{
                            height: 18,
                            fontSize: '0.6rem',
                            fontWeight: 600,
                            cursor: 'help',
                            bgcolor: environment === 'Production'
                                ? alpha(theme.palette.success.main, 0.1)
                                : alpha(theme.palette.warning.main, 0.1),
                            color: environment === 'Production'
                                ? theme.palette.success.main
                                : theme.palette.warning.main,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                transform: 'scale(1.05)',
                                bgcolor: environment === 'Production'
                                    ? alpha(theme.palette.success.main, 0.2)
                                    : alpha(theme.palette.warning.main, 0.2),
                            },
                        }}
                    />
                </Tooltip>

                <Typography variant="caption" sx={{ color: theme.palette.divider }}>
                    |
                </Typography>

                {/* Location with Tooltip */}
                <Tooltip
                    title="Built with ❤️ in Lagos, Nigeria"
                    arrow
                    placement="top"
                >
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ cursor: 'help' }}>
                        <IconifyIcon
                            icon="solar:map-point-bold"
                            width={12}
                            height={12}
                            sx={{ color: theme.palette.text.disabled }}
                        />
                        <Typography
                            variant="caption"
                            sx={{
                                fontSize: '0.7rem',
                                color: theme.palette.text.secondary,
                            }}
                        >
                            Lagos, Nigeria
                        </Typography>
                    </Stack>
                </Tooltip>
            </Stack>
        </Stack>
    );
};
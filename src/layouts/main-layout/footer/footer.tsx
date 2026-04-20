// src/layouts/main-layout/footer/footer.tsx
import { Stack, Typography, type StackProps, Chip, Tooltip, alpha, Box } from '@mui/material';
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
        <Box
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: (theme) => theme.zIndex.appBar + 10,
            }}
        >
            <Stack
                component="footer"
                direction={isMobileScreen ? 'column' : 'row'}
                alignItems="center"
                justifyContent="center"
                spacing={isMobileScreen ? 0.5 : 2}
                sx={{
                    backgroundColor: alpha(theme.palette.background.default, 0.98),
                    backdropFilter: 'blur(12px)',
                    borderTop: `1px solid ${theme.palette.divider}`,
                    py: isMobileScreen ? 1 : 1.2,
                    px: open ? 3 : 2,
                    width: '100%',
                    transition: 'all 0.3s ease',
                    boxShadow: '0px -4px 20px rgba(0, 0, 0, 0.05)',
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
                            color: theme.palette.text.primary,
                        }}
                    >
                        SchoolPilot © {year}
                    </Typography>

                    <Typography variant="caption" sx={{ color: theme.palette.divider }}>
                        |
                    </Typography>

                    {/* Version with Tooltip - Enhanced visibility */}
                    <Tooltip
                        title={
                            <Stack spacing={0.8} sx={{ p: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                                    📦 Release Information
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <span>📅</span> <span style={{ fontWeight: 600 }}>Date:</span> {formattedReleaseDate}
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <span>⏰</span> <span style={{ fontWeight: 600 }}>Time:</span> {releaseTime}
                                </Typography>
                                {/* <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <span>🔢</span> <span style={{ fontWeight: 600 }}>Version:</span> {version}
                                </Typography> */}
                            </Stack>
                        }
                        arrow
                        placement="top"
                        componentsProps={{
                            tooltip: {
                                sx: {
                                    bgcolor: theme.palette.mode === 'dark'
                                        ? theme.palette.grey[900]
                                        : theme.palette.common.white,
                                    color: theme.palette.text.primary,
                                    boxShadow: theme.shadows[8],
                                    border: `2px solid ${theme.palette.primary.main}`,
                                    borderRadius: 2,
                                    py: 1,
                                    px: 2,
                                    maxWidth: 260,
                                    fontSize: '0.75rem',
                                }
                            },
                            arrow: {
                                sx: {
                                    color: theme.palette.mode === 'dark'
                                        ? theme.palette.grey[900]
                                        : theme.palette.common.white,
                                    '&::before': {
                                        border: `2px solid ${theme.palette.primary.main}`,
                                    }
                                }
                            }
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                fontSize: '0.7rem',
                                fontFamily: 'monospace',
                                color: theme.palette.primary.main,
                                cursor: 'pointer',
                                fontWeight: 600,
                                borderBottom: `1px dashed ${theme.palette.primary.main}`,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    color: theme.palette.secondary.main,
                                    borderBottomColor: theme.palette.secondary.main,
                                    transform: 'translateY(-2px)',
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    paddingX: '4px',
                                    borderRadius: '4px',
                                },
                            }}
                        >
                            Release Version: {version}
                        </Typography>
                    </Tooltip>

                    <Typography variant="caption" sx={{ color: theme.palette.divider }}>
                        |
                    </Typography>

                    {/* Environment Chip with Enhanced Tooltip */}
                    <Tooltip
                        title={
                            <Stack spacing={0.5} sx={{ p: 0.5 }}>
                                <Typography variant="caption">
                                    {environment === 'Production'
                                        ? '🚀 Live production environment'
                                        : '⚠️ Staging environment'}
                                </Typography>
                                <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.8 }}>
                                    {environment === 'Production'
                                        ? 'All systems operational'
                                        : 'For testing purposes'}
                                </Typography>
                            </Stack>
                        }
                        arrow
                        placement="top"
                        componentsProps={{
                            tooltip: {
                                sx: {
                                    bgcolor: theme.palette.background.paper,
                                    boxShadow: theme.shadows[6],
                                    border: `1px solid ${environment === 'Production'
                                        ? theme.palette.success.main
                                        : theme.palette.warning.main}`,
                                    borderRadius: 1.5,
                                }
                            }
                        }}
                    >
                        <Chip
                            size="small"
                            label={environment}
                            sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                bgcolor: environment === 'Production'
                                    ? alpha(theme.palette.success.main, 0.15)
                                    : alpha(theme.palette.warning.main, 0.15),
                                color: environment === 'Production'
                                    ? theme.palette.success.main
                                    : theme.palette.warning.main,
                                border: `1px solid ${environment === 'Production'
                                    ? alpha(theme.palette.success.main, 0.5)
                                    : alpha(theme.palette.warning.main, 0.5)}`,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                    bgcolor: environment === 'Production'
                                        ? alpha(theme.palette.success.main, 0.25)
                                        : alpha(theme.palette.warning.main, 0.25),
                                },
                            }}
                        />
                    </Tooltip>

                    <Typography variant="caption" sx={{ color: theme.palette.divider }}>
                        |
                    </Typography>

                    {/* Location with Enhanced Tooltip */}
                    <Tooltip
                        title={
                            <Stack spacing={0.5} sx={{ p: 0.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                    🇳🇬 Built with ❤️ in Lagos, Nigeria
                                </Typography>
                                <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.8 }}>
                                    Global Team • Local Excellence
                                </Typography>
                            </Stack>
                        }
                        arrow
                        placement="top"
                        componentsProps={{
                            tooltip: {
                                sx: {
                                    bgcolor: theme.palette.background.paper,
                                    boxShadow: theme.shadows[6],
                                    border: `1px solid ${theme.palette.primary.main}`,
                                    borderRadius: 1.5,
                                }
                            }
                        }}
                    >
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ cursor: 'pointer' }}>
                            <IconifyIcon
                                icon="solar:map-point-bold"
                                width={14}
                                height={14}
                                sx={{ color: theme.palette.primary.main }}
                            />
                            <Typography
                                variant="caption"
                                sx={{
                                    fontSize: '0.7rem',
                                    color: theme.palette.text.secondary,
                                    transition: 'color 0.2s ease',
                                    '&:hover': {
                                        color: theme.palette.primary.main,
                                    },
                                }}
                            >
                                Lagos, Nigeria
                            </Typography>
                        </Stack>
                    </Tooltip>
                </Stack>
            </Stack>
        </Box>
    );
};
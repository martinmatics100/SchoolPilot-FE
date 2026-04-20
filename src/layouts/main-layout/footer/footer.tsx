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
                zIndex: (theme) => theme.zIndex.appBar + 1,
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

                <Typography
                    variant="caption"
                    sx={{
                        fontSize: '0.7rem',
                        fontFamily: 'monospace',
                        color: theme.palette.text.secondary,
                    }}
                >
                    Release Version: {version}
                </Typography>

                <Typography variant="caption" sx={{ color: theme.palette.divider }}>
                    |
                </Typography>

                <Chip
                    size="small"
                    label={environment}
                    sx={{
                        height: 18,
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        bgcolor: environment === 'Production'
                            ? alpha(theme.palette.success.main, 0.1)
                            : alpha(theme.palette.warning.main, 0.1),
                        color: environment === 'Production'
                            ? theme.palette.success.main
                            : theme.palette.warning.main,
                    }}
                />

                <Typography variant="caption" sx={{ color: theme.palette.divider }}>
                    |
                </Typography>

                <Stack direction="row" alignItems="center" spacing={0.5}>
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
            </Stack>
        </Stack>
    );
};
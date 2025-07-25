// src/layouts/main-layout/footer/footer.tsx
import { Box, Link, Stack, Typography, type StackProps } from '@mui/material';
import { useBreakpoints } from '../../../providers/breakPointsProvider';
import { type ReactElement } from 'react';
import { useTheme } from '@mui/material';

interface FooterProps extends StackProps {
    open: boolean;
}

export const Footer = ({ open, ...rest }: FooterProps): ReactElement => {
    const { down } = useBreakpoints();
    const isMobileScreen = down('sm');
    const theme = useTheme();

    return (
        <Stack
            component="footer"
            direction="row"
            alignItems="center"
            justifyContent="center"
            height={40} // compact height
            width="100%"
            spacing={1}
            sx={{
                backgroundColor: 'background.default',
                borderTop: '1px solid #e0e0e0',
                zIndex: (theme) => theme.zIndex.appBar + 1,
                ...rest.sx, // allow overriding styles like position
            }}
            {...rest}
        >
            <Typography
                variant="caption"
                sx={{
                    fontSize: '0.75rem',
                    textAlign: 'center',
                    color: 'text.primary',
                }}
            >
                SchoolPilot © 2025 | Release Version: 1.0.2738 | Environment: Production | Built in Lagos Nigeria.

                {/* {`SchoolPilot © ${year} | Release Version: ${version} | Environment: ${environment} | Built in Lagos Nigeria.`} */}
            </Typography>
        </Stack>
    );
};

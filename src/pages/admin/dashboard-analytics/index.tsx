import { Box } from '@mui/material';
import DashboardStats from '../../../components/card-component';
import UserDistribution from '../../../components/distributions/gender-distribution';
import LoadingHandler from '../../../components/loading/pageLoaderHandler';

const Index = () => {
    return (
        <div>
            <h1>Dashboard Analytics</h1>
            <LoadingHandler>
                <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={3.5}>
                    <Box gridColumn={{ xs: 'span 12', '2xl': 'span 8' }} order={{ xs: 0 }}>
                        <DashboardStats />
                    </Box>
                    <Box gridColumn={{ xs: 'span 12', lg: 'span 4' }} order={{ xs: 1, '2xl': 1 }}>
                        <UserDistribution />
                    </Box>
                </Box>
            </LoadingHandler>
        </div>
    );
};

export default Index;
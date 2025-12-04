import React, { useEffect, useState, useMemo } from 'react';
import { ReusableTable, type Column } from '../../../../components/table';
import { useTheme } from '@mui/material';
import { getInitialAuthData } from '../../../../utils/apiClient';
import { useEnums } from '../../../../hooks/useEnums';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { fetchSchoolLevels } from '../../../../api/enumsApi';
import { SchoolService } from '../../../../api/schoolService';
import { type SchoolLevel, type SchoolDetails } from '../../../../types/interfaces/i-school';

const SchoolLevels = () => {
    const [levels, setLevels] = useState<SchoolLevel[]>([]);
    const [schoolDetails, setSchoolDetails] = useState<SchoolDetails | null>(null);
    const [loading, setLoading] = useState(false);

    const theme = useTheme();
    const { selectedAccount } = getInitialAuthData();
    const { enums, isLoading: isEnumsLoading } = useEnums({ fetchPermissionData: false });

    const levelMap = useMemo(() => {
        return (
            enums?.SchoolLevels?.reduce(
                (acc: Record<string, string>, item: { value: number; displayName: string; name: string }) => {
                    acc[item.value] = item.displayName || item.name;
                    return acc;
                },
                {}
            ) || {}
        );
    }, [enums]);

    const fetchLevelsData = async () => {
        if (!selectedAccount) {
            console.error('No account selected');
            setLevels([]);
            return;
        }

        setLoading(true);
        try {
            const levelsData = await fetchSchoolLevels(selectedAccount);
            setLevels(levelsData);
        } catch (error) {
            console.error('Error fetching school levels:', error);
            setLevels([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchSchoolDetails = async () => {
        if (!selectedAccount) {
            console.error('No account selected');
            setSchoolDetails(null);
            return;
        }

        setLoading(true);
        try {
            const details = await SchoolService.getSchoolDetails();
            setSchoolDetails(details);
        } catch (error) {
            console.error('Error fetching school details:', error);
            setSchoolDetails(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedAccount) {
            setLoading(true);
            Promise.all([
                fetchLevelsData(),
                fetchSchoolDetails()
            ]).finally(() => setLoading(false));
        }
    }, [selectedAccount]);

    const columns: Column[] = [
        {
            id: 'name',
            label: 'Level',
            minWidth: 150,
            sortable: true,
            format: (value: string, row: SchoolLevel) => (
                <span>
                    {levelMap[row.value.toString()] || value}
                </span>
            ),
        },
    ];

    if (loading || isEnumsLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div>
            <ReusableTable
                title="School Levels"
                columns={columns}
                data={levels}
                showActionColumn={false}
                loading={loading || isEnumsLoading}
                showCheckboxes={false}
                showPagination={false}
                showSorting={false}
            />
        </div>
    );
}

export default SchoolLevels;
import React, { useEffect, useState, useMemo } from 'react';
import { ReusableTable, type Column } from '../../../../components/table';
import { useTheme } from '@mui/material';
import { getInitialAuthData } from '../../../../utils/apiClient';
import { useEnums } from '../../../../hooks/useEnums';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { type SchoolTerm, type SchoolDetails } from '../../../../types/interfaces/i-school';
import { SchoolService } from '../../../../api/schoolService';

const Index = () => {
    const [terms, setTerms] = useState<SchoolTerm[]>([]);
    const [schoolDetails, setSchoolDetails] = useState<SchoolDetails | null>(null);
    const [loading, setLoading] = useState(false);

    const theme = useTheme();
    const { selectedAccount } = getInitialAuthData();
    const { enums, isLoading: isEnumsLoading } = useEnums({ fetchPermissionData: false });

    const termMap = useMemo(() => {
        return (
            enums?.SchoolTerms?.reduce(
                (acc: Record<string, string>, item: { value: number; displayName: string; name: string }) => {
                    acc[item.value] = item.displayName || item.name;
                    return acc;
                },
                {}
            ) || {}
        );
    }, [enums]);

    const fetchSchoolTerms = async () => {
        if (!selectedAccount) {
            console.error('No account selected');
            setTerms([]);
            return;
        }

        setLoading(true);
        try {
            const termsData = await SchoolService.getSchoolTerms();
            setTerms(termsData);
        } catch (error) {
            console.error('Error fetching school terms:', error);
            setTerms([]);
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
            fetchSchoolTerms();
            fetchSchoolDetails();
        }
    }, [selectedAccount]);


    const columns: Column[] = [
        {
            id: 'name',
            label: 'Term',
            minWidth: 150,
            sortable: true,
            format: (value: string, row: SchoolTerm) => (
                <span>
                    {termMap[row.value.toString()] || value}
                    {schoolDetails?.currentTerm === row.value && (
                        <span style={{ color: "red", marginLeft: '8px' }}>
                            (active term)
                        </span>
                    )}
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
                title="School Terms"
                columns={columns}
                data={terms}
                showActionColumn={false}
                loading={loading || isEnumsLoading}
                showCheckboxes={false}
                showPagination={false}
                showSorting={false}
            />
        </div>
    );
};

export default Index;
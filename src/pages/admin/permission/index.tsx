import React, { useState, useEffect, useCallback } from 'react';
import {
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Checkbox,
    Paper,
    Typography,
    Box,
    Divider,
    useTheme,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    type SelectChangeEvent,
    Alert
} from '@mui/material';
import { useEnums } from '../../../hooks/useEnums';
import { createApiClient } from '../../../utils/apiClient';
import { ActionButton } from '../../../components/action-button';
import { fetchUsers } from '../../../api/userService';
import { getInitialAuthData } from '../../../utils/apiClient';

interface PermissionActions {
    [key: string]: boolean;
}

interface Feature {
    id: string;
    name: string;
    permissions: PermissionActions;
    availableActions: string[];
}

interface ParentModule {
    id: string;
    name: string;
    moduleActions: string[];
    features: Feature[];
}

interface UserPermission {
    resource: string;
    resourceType: number;
    action: number;
    value: boolean;
}

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

const PermissionTable: React.FC = () => {
    const theme = useTheme();
    const { selectedAccount } = getInitialAuthData();
    const {
        enums,
        permissionGroups,
        permissionDependencies,
        isLoading: enumsLoading,
        error: enumsError
    } = useEnums({ fetchPermissionData: true });

    const buttonContainerStyles = {
        position: 'sticky',
        bottom: 0,
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-end',
        padding: theme.spacing(2),
        backgroundColor: theme.palette.background.default,
        zIndex: theme.zIndex.appBar,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        borderTop: `1px solid ${theme.palette.divider}`,
    };

    const tableContainerStyles = {
        maxWidth: 1500,
        mx: 'auto',
        mt: 2,
        mb: 2,
    };

    const [permissions, setPermissions] = useState<ParentModule[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [users, setUsers] = useState<User[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [permissionsError, setPermissionsError] = useState<string | null>(null);
    const [isPermissionsLoading, setIsPermissionsLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    // Fetch users list
    useEffect(() => {
        const loadUsers = async () => {
            if (!selectedAccount) {
                setPermissionsError('No account selected');
                return;
            }

            setUsersLoading(true);
            setPermissionsError(null);
            try {
                const { items } = await fetchUsers(selectedAccount, 1, 1000);
                setUsers(items || []);
            } catch (error) {
                console.error('Error fetching users:', error);
                setPermissionsError('Failed to fetch users');
                setUsers([]);
            } finally {
                setUsersLoading(false);
            }
        };

        loadUsers();
    }, [selectedAccount]);

    // Get current user ID on component mount
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const apiClient = createApiClient();
                const userData = await apiClient.getCurrentUser();
                setCurrentUserId(userData.id);
            } catch (error) {
                console.error('Error fetching current user:', error);
            }
        };

        fetchCurrentUser();
    }, []);

    // Set default selected user to current user when both are available
    useEffect(() => {
        if (currentUserId && users.length > 0 && !selectedUserId) {
            setSelectedUserId(currentUserId);
        }
    }, [currentUserId, users, selectedUserId]);

    // Fetch permissions for selected user - SIMPLIFIED
    useEffect(() => {
        const fetchUserPermissions = async () => {
            if (!selectedUserId || !enums?.PermissionActions) {
                return;
            }

            setIsPermissionsLoading(true);
            setPermissionsError(null);
            setSaveSuccess(false);

            try {
                const apiClient = createApiClient();
                const response = await apiClient.get(`/v1/users/${selectedUserId}/permissions`);
                setUserPermissions(response || []);
            } catch (error) {
                console.error('Error fetching user permissions:', error);
                setPermissionsError('Failed to fetch user permissions');
                setUserPermissions([]);
            } finally {
                setIsPermissionsLoading(false);
                setInitialLoadComplete(true);
            }
        };

        fetchUserPermissions();
    }, [selectedUserId, enums?.PermissionActions]); // Remove enums.PermissionActions from dependencies to prevent re-fetching

    // Build permissions structure - ONLY when all required data is available
    const buildPermissionsStructure = useCallback(() => {
        if (!permissionGroups.length ||
            !enums?.ParentPermission ||
            !enums?.PermissionActions ||
            !userPermissions ||
            isPermissionsLoading) {
            return;
        }

        console.log('Building permissions structure for user:', selectedUserId);

        const parentPermissions = enums.ParentPermission || [];
        const permissionActions = enums.PermissionActions || [];

        const transformedData: ParentModule[] = permissionGroups.map((group, groupIndex) => {
            const groupAvailableActions = group.availableActions || [];
            const parentPerms = group.parentPermissions || [];
            const featureActionsMap = group.featureAvailableActions || {};

            const groupActions = permissionActions
                .filter(action => groupAvailableActions.includes(action.value))
                .map(action => action.name.toLowerCase());

            const features = parentPermissions
                .filter(permission => parentPerms.includes(permission.value))
                .map((permission, permIndex) => {
                    const featureAvailableActions = featureActionsMap[permission.value] || [];
                    const featureActions = permissionActions
                        .filter(action => featureAvailableActions.includes(action.value))
                        .map(action => action.name.toLowerCase());

                    // Initialize all permissions to false
                    const permissionsObj: PermissionActions = {};
                    featureActions.forEach(action => {
                        permissionsObj[action] = false;
                    });

                    // Apply user permissions if they exist
                    if (userPermissions.length > 0) {
                        featureActions.forEach(actionName => {
                            const actionObj = permissionActions.find(a => a.name.toLowerCase() === actionName);
                            if (actionObj) {
                                const userPermission = userPermissions.find(
                                    perm => perm.resource === permission.value.toString() &&
                                        perm.action === actionObj.value
                                );
                                if (userPermission?.value === true) {
                                    permissionsObj[actionName] = true;
                                }
                            }
                        });
                    }

                    return {
                        id: permission?.value?.toString() || `perm-${groupIndex}-${permIndex}`,
                        name: permission?.name || 'Unnamed Permission',
                        permissions: permissionsObj,
                        availableActions: featureActions
                    };
                });

            return {
                id: group?.value?.toString() || `group-${groupIndex}`,
                name: group?.groupName || group?.name || 'Unnamed Group',
                moduleActions: groupActions,
                features
            };
        });

        setPermissions(transformedData);
        setHasChanges(false); // Reset changes when building new structure
    }, [permissionGroups, enums, userPermissions, isPermissionsLoading, selectedUserId]);

    // Trigger build when user permissions change
    useEffect(() => {
        if (!isPermissionsLoading) {
            buildPermissionsStructure();
        }
    }, [userPermissions, isPermissionsLoading, buildPermissionsStructure]);

    // Check for changes
    useEffect(() => {
        if (userPermissions.length > 0 && permissions.length > 0 && enums?.PermissionActions) {
            const changesExist = permissions.some(parentModule =>
                parentModule.features.some(feature =>
                    Object.entries(feature.permissions).some(([actionName, isAllowed]) => {
                        const actionObj = enums.PermissionActions?.find(a => a.name.toLowerCase() === actionName);
                        if (!actionObj) return false;

                        const originalPermission = userPermissions.find(
                            perm => perm.resource === feature.id && perm.action === actionObj.value
                        );

                        return (originalPermission?.value || false) !== isAllowed;
                    })
                )
            );
            setHasChanges(changesExist);
        } else {
            setHasChanges(false);
        }
    }, [permissions, userPermissions, enums?.PermissionActions]);

    const handleUserChange = (event: SelectChangeEvent) => {
        const newUserId = event.target.value;
        setSelectedUserId(newUserId);
        setHasChanges(false);
        setPermissions([]); // Clear permissions
        setUserPermissions([]); // Clear user permissions
        setSaveSuccess(false);
        setInitialLoadComplete(false);
    };

    const initializeFeaturePermissions = (permissionId: number, actions: string[]): PermissionActions => {
        const defaultPermissions: PermissionActions = {};
        actions.forEach(action => {
            defaultPermissions[action] = false;
        });
        return defaultPermissions;
    };

    const applyDependencies = (
        permissionsObj: PermissionActions,
        action: string,
        checked: boolean,
        featureId: string
    ) => {
        const actionObj = enums.PermissionActions?.find(a => a.name.toLowerCase() === action);
        if (!actionObj) return;

        const actionValue = actionObj.value;
        const dependencyKey = `${featureId}_${actionValue}`;
        const dependencies = permissionDependencies[dependencyKey];

        if (dependencies && checked) {
            dependencies.forEach(depValue => {
                const depAction = enums.PermissionActions?.find(a => a.value === depValue);
                if (depAction && typeof permissionsObj[depAction.name.toLowerCase()] === 'boolean') {
                    permissionsObj[depAction.name.toLowerCase()] = true;
                }
            });
        }

        if (!checked) {
            Object.entries(permissionDependencies).forEach(([key, deps]) => {
                const [permId, permAction] = key.split('_');
                if (permId === featureId && deps.includes(actionValue)) {
                    const dependentAction = enums.PermissionActions?.find(a => a.value === parseInt(permAction));
                    if (dependentAction && typeof permissionsObj[dependentAction.name.toLowerCase()] === 'boolean') {
                        permissionsObj[dependentAction.name.toLowerCase()] = false;
                    }
                }
            });
        }
    };

    const getParentCheckboxState = (parentModule: ParentModule) => {
        if (!parentModule.features.length) {
            return { checked: false, indeterminate: false };
        }

        let totalApplicableCheckboxes = 0;
        let totalCheckedCheckboxes = 0;

        parentModule.features.forEach(feature => {
            feature.availableActions.forEach(action => {
                if (typeof feature.permissions[action] === 'boolean') {
                    totalApplicableCheckboxes++;
                    if (feature.permissions[action] === true) {
                        totalCheckedCheckboxes++;
                    }
                }
            });
        });

        if (totalApplicableCheckboxes === 0) {
            return { checked: false, indeterminate: false };
        }

        if (totalCheckedCheckboxes === totalApplicableCheckboxes) {
            return { checked: true, indeterminate: false };
        }
        if (totalCheckedCheckboxes > 0) {
            return { checked: false, indeterminate: true };
        }
        return { checked: false, indeterminate: false };
    };

    const getMasterCheckboxState = () => {
        let totalApplicableCheckboxes = 0;
        let totalCheckedCheckboxes = 0;

        permissions.forEach(parentModule => {
            parentModule.features.forEach(feature => {
                parentModule.moduleActions.forEach(action => {
                    if (typeof feature.permissions[action] === 'boolean') {
                        totalApplicableCheckboxes++;
                        if (feature.permissions[action] === true) {
                            totalCheckedCheckboxes++;
                        }
                    }
                });
            });
        });

        if (totalApplicableCheckboxes === 0) {
            return { checked: false, indeterminate: false };
        }

        if (totalCheckedCheckboxes === totalApplicableCheckboxes) {
            return { checked: true, indeterminate: false };
        }
        if (totalCheckedCheckboxes > 0) {
            return { checked: false, indeterminate: true };
        }
        return { checked: false, indeterminate: false };
    };

    const getModuleColumnCheckboxState = (parentModule: ParentModule, action: string) => {
        let allColumnChecked = true;
        let anyColumnChecked = false;
        let hasAnyCheckboxInColumn = false;

        parentModule.features.forEach(feature => {
            if (feature.availableActions.includes(action)) {
                hasAnyCheckboxInColumn = true;
                if (feature.permissions[action] === true) {
                    anyColumnChecked = true;
                } else {
                    allColumnChecked = false;
                }
            }
        });

        if (!hasAnyCheckboxInColumn) {
            return { checked: false, indeterminate: false, disabled: true };
        }

        if (allColumnChecked && anyColumnChecked) {
            return { checked: true, indeterminate: false, disabled: false };
        }
        if (anyColumnChecked) {
            return { checked: false, indeterminate: true, disabled: false };
        }
        return { checked: false, indeterminate: false, disabled: false };
    };

    const handleParentCheckboxChange = (parentId: string, checked: boolean) => {
        setPermissions(prevPermissions =>
            prevPermissions.map(parentModule =>
                parentModule.id === parentId
                    ? {
                        ...parentModule,
                        features: parentModule.features.map(feature => {
                            const newPermissions: PermissionActions = { ...feature.permissions };
                            parentModule.moduleActions.forEach(action => {
                                if (typeof newPermissions[action] === 'boolean') {
                                    newPermissions[action] = checked;
                                    applyDependencies(newPermissions, action, checked, feature.id);
                                }
                            });
                            return {
                                ...feature,
                                permissions: newPermissions,
                            };
                        }),
                    }
                    : parentModule
            )
        );
    };

    const handleModuleColumnCheckboxChange = (parentId: string, action: string, checked: boolean) => {
        setPermissions(prevPermissions => {
            return prevPermissions.map(parentModule => {
                if (parentModule.id === parentId) {
                    return {
                        ...parentModule,
                        features: parentModule.features.map(feature => {
                            const newPermissions = { ...feature.permissions };

                            if (typeof newPermissions[action] === 'boolean') {
                                newPermissions[action] = checked;
                                applyDependencies(newPermissions, action, checked, feature.id);
                            }

                            return { ...feature, permissions: newPermissions };
                        })
                    };
                }
                return parentModule;
            });
        });
    };

    const handleMasterCheckboxChange = (checked: boolean) => {
        setPermissions(prevPermissions =>
            prevPermissions.map(parentModule => ({
                ...parentModule,
                features: parentModule.features.map(feature => {
                    const newPermissions: PermissionActions = { ...feature.permissions };
                    parentModule.moduleActions.forEach(action => {
                        if (typeof newPermissions[action] === 'boolean') {
                            newPermissions[action] = checked;
                            applyDependencies(newPermissions, action, checked, feature.id);
                        }
                    });
                    return { ...feature, permissions: newPermissions };
                }),
            }))
        );
    };

    const isFeatureRowChecked = (feature: Feature, moduleActions: string[]) => {
        const applicableActions = moduleActions.filter(action => typeof feature.permissions[action] === 'boolean');
        if (applicableActions.length === 0) {
            return false;
        }
        return applicableActions.every(action => feature.permissions[action] === true);
    };

    const isFeatureRowIndeterminate = (feature: Feature, moduleActions: string[]) => {
        const allChecked = isFeatureRowChecked(feature, moduleActions);
        const applicableActions = moduleActions.filter(action => typeof feature.permissions[action] === 'boolean');
        if (applicableActions.length === 0) {
            return false;
        }
        const anyChecked = applicableActions.some(action => feature.permissions[action] === true);
        return anyChecked && !allChecked;
    };

    const handleFeatureRowCheckboxChange = (parentId: string, featureId: string, checked: boolean) => {
        setPermissions(prevPermissions =>
            prevPermissions.map(parentModule =>
                parentModule.id === parentId
                    ? {
                        ...parentModule,
                        features: parentModule.features.map(feature => {
                            if (feature.id === featureId) {
                                const newPermissions: PermissionActions = { ...feature.permissions };

                                parentModule.moduleActions.forEach(action => {
                                    if (typeof newPermissions[action] === 'boolean') {
                                        newPermissions[action] = checked;
                                        applyDependencies(newPermissions, action, checked, feature.id);
                                    }
                                });

                                return {
                                    ...feature,
                                    permissions: newPermissions,
                                };
                            }
                            return feature;
                        }),
                    }
                    : parentModule
            )
        );
    };

    const handleFeatureActionCheckboxChange = (
        parentId: string,
        featureId: string,
        action: string,
        checked: boolean
    ) => {
        setPermissions(prev => prev.map(parentModule =>
            parentModule.id === parentId
                ? {
                    ...parentModule,
                    features: parentModule.features.map(feature => {
                        if (feature.id === featureId) {
                            const newPermissions = { ...feature.permissions };
                            if (typeof newPermissions[action] === 'boolean') {
                                newPermissions[action] = checked;
                                applyDependencies(newPermissions, action, checked, featureId);
                            }
                            return { ...feature, permissions: newPermissions };
                        }
                        return feature;
                    }),
                }
                : parentModule
        ));
    };

    const handleSavePermissions = async () => {
        if (!selectedUserId) return;

        setIsSaving(true);
        setPermissionsError(null);
        setSaveSuccess(false);

        try {
            const apiClient = createApiClient();

            const permissionsToSave: UserPermission[] = [];

            permissions.forEach(parentModule => {
                parentModule.features.forEach(feature => {
                    feature.availableActions.forEach(actionName => {
                        const actionObj = enums.PermissionActions?.find(a => a.name.toLowerCase() === actionName);
                        if (actionObj) {
                            const originalPermission = userPermissions.find(
                                perm => perm.resource === feature.id && perm.action === actionObj.value
                            );

                            permissionsToSave.push({
                                resource: feature.id,
                                resourceType: originalPermission?.resourceType ?? parseInt(parentModule.id),
                                action: actionObj.value,
                                value: feature.permissions[actionName] || false
                            });
                        }
                    });
                });
            });

            await apiClient.put(`/v1/users/${selectedUserId}/permissions`, {
                permissions: permissionsToSave
            });

            // Update local userPermissions state with saved permissions
            setUserPermissions(permissionsToSave);
            setHasChanges(false);
            setSaveSuccess(true);

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSaveSuccess(false);
            }, 3000);

        } catch (error) {
            console.error('Failed to save permissions:', error);
            setPermissionsError('Failed to save permissions');
        } finally {
            setIsSaving(false);
        }
    };

    const customCheckboxStyle = {
        transform: 'scale(1.35)',
        color: theme.palette.grey[500],
        '&.Mui-checked': {
            color: theme.palette.text.link,
        },
    };

    const isLoading = enumsLoading || usersLoading || isPermissionsLoading;

    if (enumsLoading) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (enumsError) {
        return (
            <Box color="error.main" p={4} textAlign="center">
                Error loading permissions: {enumsError}
            </Box>
        );
    }

    const masterCheckboxState = getMasterCheckboxState();
    const maxActionColumns = Math.max(0, ...permissions.map(p => p.moduleActions.length));

    return (
        <Box sx={{ position: 'relative', minHeight: '80%' }}>
            {/* User Selector */}
            <Box sx={{
                maxWidth: 1500,
                mx: 'auto',
                mt: 2,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                flexWrap: 'wrap'
            }}>
                <FormControl sx={{ minWidth: 300, flex: 1 }}>
                    <InputLabel id="user-select-label">Select User</InputLabel>
                    <Select
                        labelId="user-select-label"
                        id="user-select"
                        value={selectedUserId}
                        label="Select User"
                        onChange={handleUserChange}
                        disabled={usersLoading || users.length === 0}
                    >
                        {usersLoading ? (
                            <MenuItem disabled>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <CircularProgress size={20} />
                                    Loading users...
                                </Box>
                            </MenuItem>
                        ) : (
                            users.map((user) => (
                                <MenuItem key={user.id} value={user.id}>
                                    {`${user.firstName} ${user.lastName} (${user.email})`}
                                </MenuItem>
                            ))
                        )}
                    </Select>
                </FormControl>

                {currentUserId && selectedUserId && currentUserId !== selectedUserId && (
                    <Typography variant="body2" color="warning.main" sx={{ display: 'flex', alignItems: 'center' }}>
                        ⚠️ You are editing permissions for another user
                    </Typography>
                )}
            </Box>

            {/* Success Message */}
            {saveSuccess && (
                <Box sx={{ maxWidth: 1500, mx: 'auto', mb: 2 }}>
                    <Alert severity="success" onClose={() => setSaveSuccess(false)}>
                        Permissions saved successfully!
                    </Alert>
                </Box>
            )}

            {/* Error Display */}
            {permissionsError && (
                <Box sx={{ maxWidth: 1500, mx: 'auto', mb: 2 }}>
                    <Alert severity="error" onClose={() => setPermissionsError(null)}>
                        {permissionsError}
                    </Alert>
                </Box>
            )}

            {/* Loading State for Permissions */}
            {isPermissionsLoading && (
                <Box display="flex" justifyContent="center" mt={4}>
                    <CircularProgress />
                </Box>
            )}

            {/* No User Selected State */}
            {/* {!selectedUserId && !isPermissionsLoading && (
                <Box display="flex" justifyContent="center" mt={4}>
                    <Typography variant="h6" color="text.secondary">
                        Please select a user to view and edit permissions
                    </Typography>
                </Box>
            )} */}

            {/* Permission Table */}
            {!isPermissionsLoading && permissions.length > 0 && selectedUserId && (
                <Box sx={tableContainerStyles}>
                    <TableContainer component={Paper} sx={{
                        overflow: 'auto',
                        mx: 'auto',
                        maxHeight: 'calc(100vh - 350px)',
                        bgcolor: theme.palette.background.default
                    }}>
                        <Table stickyHeader aria-label="permission table">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{
                                        fontWeight: 'bold',
                                        minWidth: 200,
                                        bgcolor: theme.palette.background.default
                                    }}>
                                        <Box display="flex" alignItems="center">
                                            <Checkbox
                                                checked={masterCheckboxState.checked}
                                                indeterminate={masterCheckboxState.indeterminate}
                                                onChange={(e) => handleMasterCheckboxChange(e.target.checked)}
                                                sx={{ mr: 1, ...customCheckboxStyle }}
                                            />
                                            <Typography variant="caption" fontWeight="bold">
                                                SELECT ALL PERMISSIONS
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    {Array.from({ length: maxActionColumns }).map((_, i) => (
                                        <TableCell
                                            key={`empty-header-col-${i}`}
                                            sx={{ bgcolor: theme.palette.background.default }}
                                        />
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {permissions.map((parentModule, index) => {
                                    const { checked, indeterminate } = getParentCheckboxState(parentModule);
                                    return (
                                        <React.Fragment key={`module-${parentModule.id}`}>
                                            <TableRow sx={{ bgcolor: theme.palette.text.muted }}>
                                                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                    <Box display="flex" alignItems="center" py={1}>
                                                        <Checkbox
                                                            checked={checked}
                                                            indeterminate={indeterminate}
                                                            onChange={(e) => handleParentCheckboxChange(parentModule.id, e.target.checked)}
                                                            sx={{ mr: 1, ...customCheckboxStyle }}
                                                        />
                                                        <Typography variant="h6" component="span" fontSize="1.05rem" sx={{ color: "#000000" }}>
                                                            {parentModule.name.toUpperCase()}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                {parentModule.moduleActions.map((action, actionIndex) => {
                                                    const {
                                                        checked: colChecked,
                                                        indeterminate: colIndeterminate,
                                                        disabled: colDisabled
                                                    } = getModuleColumnCheckboxState(parentModule, action);
                                                    return (
                                                        <TableCell
                                                            key={`${parentModule.id}-${action}-header-${actionIndex}`}
                                                            align="center"
                                                            sx={{ fontWeight: '900', color: "#000000" }}
                                                        >
                                                            <Box display="flex" alignItems="center" justifyContent="center">
                                                                <Checkbox
                                                                    checked={colChecked}
                                                                    indeterminate={colIndeterminate}
                                                                    onChange={(e) => handleModuleColumnCheckboxChange(
                                                                        parentModule.id,
                                                                        action,
                                                                        e.target.checked
                                                                    )}
                                                                    disabled={colDisabled}
                                                                    sx={{ mr: 0.5, ...customCheckboxStyle }}
                                                                />
                                                                <Typography variant="body2" textTransform="capitalize">
                                                                    {action}
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>
                                                    );
                                                })}
                                                {Array.from({ length: Math.max(0, maxActionColumns - parentModule.moduleActions.length) }).map((_, i) => (
                                                    <TableCell
                                                        key={`empty-${parentModule.id}-${i}`}
                                                    />
                                                ))}
                                            </TableRow>

                                            {parentModule.features.map(feature => {
                                                const featureRowChecked = isFeatureRowChecked(feature, parentModule.moduleActions);
                                                const featureRowIndeterminate = isFeatureRowIndeterminate(feature, parentModule.moduleActions);
                                                return (
                                                    <TableRow key={`feature-${parentModule.id}-${feature.id}`}>
                                                        <TableCell sx={{ pl: 6 }}>
                                                            <Box display="flex" alignItems="center">
                                                                <Checkbox
                                                                    checked={featureRowChecked}
                                                                    indeterminate={featureRowIndeterminate}
                                                                    onChange={(e) => handleFeatureRowCheckboxChange(
                                                                        parentModule.id,
                                                                        feature.id,
                                                                        e.target.checked
                                                                    )}
                                                                    sx={{ mr: 1, ...customCheckboxStyle }}
                                                                />
                                                                <Typography variant="body2">{feature.name}</Typography>
                                                            </Box>
                                                        </TableCell>
                                                        {parentModule.moduleActions.map((action, actionIndex) => {
                                                            if (!feature.availableActions.includes(action)) {
                                                                return (
                                                                    <TableCell
                                                                        key={`empty-${parentModule.id}-${feature.id}-${action}-${actionIndex}`}
                                                                        align="center"
                                                                    >
                                                                        <Box width={48} height={48} />
                                                                    </TableCell>
                                                                );
                                                            }
                                                            return (
                                                                <TableCell
                                                                    key={`action-${parentModule.id}-${feature.id}-${action}-${actionIndex}`}
                                                                    align="center"
                                                                >
                                                                    <Checkbox
                                                                        checked={feature.permissions[action]}
                                                                        onChange={(e) => handleFeatureActionCheckboxChange(
                                                                            parentModule.id,
                                                                            feature.id,
                                                                            action,
                                                                            e.target.checked
                                                                        )}
                                                                        sx={customCheckboxStyle}
                                                                    />
                                                                </TableCell>
                                                            );
                                                        })}
                                                        {Array.from({ length: Math.max(0, maxActionColumns - parentModule.moduleActions.length) }).map((_, i) => (
                                                            <TableCell
                                                                key={`empty-feature-${parentModule.id}-${feature.id}-${i}`}
                                                            />
                                                        ))}
                                                    </TableRow>
                                                );
                                            })}

                                            {index < permissions.length - 1 && (
                                                <TableRow key={`divider-${parentModule.id}`}>
                                                    <TableCell colSpan={maxActionColumns + 1} sx={{ p: 0 }}>
                                                        <Divider sx={{ my: 1, backgroundColor: theme.palette.divider }} />
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* No Permissions State */}
            {!isPermissionsLoading && permissions.length === 0 && selectedUserId && !isPermissionsLoading && initialLoadComplete && (
                <Box display="flex" justifyContent="center" mt={4}>
                    <Typography variant="h6" color="text.secondary">
                        No permissions found for this user
                    </Typography>
                </Box>
            )}

            {/* Save Button */}
            {selectedUserId && !isPermissionsLoading && permissions.length > 0 && (
                <Box sx={buttonContainerStyles}>
                    <ActionButton
                        onClick={handleSavePermissions}
                        loading={isSaving}
                        disabled={isSaving || !hasChanges || !selectedUserId}
                        variant="contained"
                        sx={{
                            minWidth: 120,
                            fontWeight: 'bold',
                            textTransform: 'none',
                            fontSize: '1rem',
                            backgroundColor: theme.palette.common.white,
                            mr: 2,
                            '&:hover': {
                                backgroundColor: theme.palette.grey[100],
                            },
                            '&.Mui-disabled': {
                                backgroundColor: theme.palette.grey[300],
                            }
                        }}
                    >
                        Save Permissions
                    </ActionButton>
                </Box>
            )}
        </Box>
    );
};

export default PermissionTable;
// src/context/index.tsx
import { createContext, useContext, useState, useEffect, type ReactNode, useMemo } from 'react';
import { UserRoles } from '../enums/user-roles';
import { encryptData } from '../utils/encryption';
import {
    createApiClient,
    createAuthClient,
    setAuthData as setApiAuthData,
    clearAuthData as clearApiAuthData,
    getCurrentUser,
    getInitialAuthData,
    parseJwt, // Import parseJwt here
    type AccountModel,
    type LocationModel
} from '../utils/apiClient';
import { isUserRole } from '../enums/user-roles';

interface ContextAccount {
    id: string;
    name: string;
    branches: LocationModel[];
}

interface AuthContextType {
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    role: UserRoles | null;
    logout: () => void;
    selectedAccount: string | null;
    selectedBranches: LocationModel[];
    setAccountSelection: (accountId: string, branches: LocationModel[]) => void;
    accounts: ContextAccount[];
    setAccounts: (accounts: ContextAccount[]) => void;
    userEmail: string | null;
    apiClient: ReturnType<typeof createApiClient>;
    accessToken: string | null;
    userId: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_BRANCHES = ['Main Campus', 'North Campus', 'East Campus'];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const initialApiAuthData = getInitialAuthData();
    const initialUser = getCurrentUser();

    // Initialize states based on initial data from localStorage/token
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!initialUser);
    const [role, setRole] = useState<UserRoles | null>(initialUser?.roles?.[0] || null);
    const [selectedAccount, setSelectedAccount] = useState<string | null>(initialApiAuthData.selectedAccount || initialUser?.accountId || null);
    const [userEmail, setUserEmail] = useState<string | null>(initialUser?.email || null);
    const [selectedBranches, setSelectedBranches] = useState<LocationModel[]>([]);
    const [accounts, setAccounts] = useState<ContextAccount[]>([]);
    const [accessToken, setAccessToken] = useState<string | null>(initialApiAuthData.accessToken);
    const [userId, setUserId] = useState<string | null>(initialUser?.userId || null); // Key: userId is derived from the token

    const authClient = useMemo(() => createAuthClient(), []);
    // apiClient needs to react to changes in selectedAccount and accessToken for headers
    const apiClient = useMemo(() => createApiClient({ selectedAccount, accessToken }), [selectedAccount, accessToken]);

    // Effect to handle initial population of selectedBranches from localStorage
    useEffect(() => {
        if (selectedAccount) {
            const storedBranches = localStorage.getItem('selectedBranches');
            if (storedBranches) {
                try {
                    const parsedBranches: LocationModel[] = JSON.parse(storedBranches);
                    if (JSON.stringify(parsedBranches) !== JSON.stringify(selectedBranches)) {
                        setSelectedBranches(parsedBranches);
                    }
                } catch (e) {
                    console.error("Failed to parse stored branches", e);
                    localStorage.removeItem('selectedBranches');
                }
            } else {
                const acc = accounts.find(a => a.id === selectedAccount);
                if (acc && JSON.stringify(acc.branches) !== JSON.stringify(selectedBranches)) {
                    setSelectedBranches(acc.branches);
                }
            }
        }
    }, [selectedAccount, accounts, selectedBranches]);

    // Add this useEffect in AuthProvider to refetch accounts on refresh
    useEffect(() => {
        const fetchAccounts = async () => {
            if (userId && accessToken && selectedAccount && accounts.length === 0) {
                try {
                    const response = await apiClient.getAccounts(userId, 1, 100);
                    const fetchedAccounts = response.items.map((account: any) => ({
                        id: String(account.id),
                        name: account.name, // 👈 ensure casing matches API response
                        branches: [] as LocationModel[]
                    }));

                    setAccounts(fetchedAccounts);

                    // Also restore selectedBranches if none exist in memory
                    const selected = fetchedAccounts.find(acc => acc.id === selectedAccount);
                    if (selected && selectedBranches.length === 0) {
                        setSelectedBranches(selected.branches);
                    }
                } catch (err) {
                    console.error("Error fetching accounts in AuthProvider:", err);
                }
            }
        };

        fetchAccounts();
    }, [userId, accessToken, selectedAccount, accounts.length]); // 👈 Dependencies


    // This effect ensures core authentication details are consistent with the current token
    useEffect(() => {
        if (accessToken) {
            const currentUserDetails = getCurrentUser(); // Re-parse the token if accessToken changes

            if (currentUserDetails) {
                // Update states only if they've changed to avoid unnecessary re-renders
                if (userEmail !== currentUserDetails.email) setUserEmail(currentUserDetails.email);
                if (role !== (currentUserDetails.roles?.[0] || null)) setRole(currentUserDetails.roles?.[0] || null);
                if (userId !== currentUserDetails.userId) setUserId(currentUserDetails.userId); // Ensure userId is always up-to-date
                if (isAuthenticated !== true) setIsAuthenticated(true); // Ensure isAuthenticated is true if token is valid
            } else {
                // If token is invalid or expired, clear auth data
                if (isAuthenticated) setIsAuthenticated(false);
                clearApiAuthData();
            }

            // Persist auth data, potentially including selectedAccount/Branches if logic needs it
            const authDataToPersist = {
                isAuthenticated: isAuthenticated, // Use the current state value
                role: role,
                selectedAccount: selectedAccount,
                selectedBranches: selectedBranches,
                userEmail: userEmail,
                accessToken: accessToken,
                userId: userId,
                timestamp: Date.now()
            };
            localStorage.setItem('authData', encryptData(authDataToPersist));

            setApiAuthData(accessToken, Intl.DateTimeFormat().resolvedOptions().timeZone, true);

        } else {
            // If no accessToken, ensure all states are cleared
            if (isAuthenticated || selectedAccount || selectedBranches.length > 0 || accounts.length > 0 || userId || userEmail || role) {
                setIsAuthenticated(false);
                setRole(null);
                setSelectedAccount(null);
                setSelectedBranches([]);
                setUserEmail(null);
                setUserId(null);
                setAccounts([]);
                clearApiAuthData();
            }
        }
    }, [accessToken]); // ONLY depend on accessToken here. Other states will derive from it.
    // Removed other states as dependencies to prevent infinite loops and ensure
    // this effect is primarily driven by token presence/change.

    // src/context/index.tsx (updated login function)
    // src/context/index.tsx (updated login function)
    const login = async (email: string, password: string) => {
        try {
            const response = await authClient.login(email, password);
            if (response && response.accessToken) {
                // Parse the token first
                const decodedToken = parseJwt(response.accessToken);

                // Prepare all the new state values
                const newUserId = decodedToken?.sub || null;
                const newUserEmail = decodedToken?.email || null;

                let newRole: UserRoles | null = null;
                const rawRoles = decodedToken?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

                if (Array.isArray(rawRoles)) {
                    const roles = rawRoles
                        .map(role => {
                            if (role === '1') return UserRoles.ADMIN;
                            if (role === '2') return UserRoles.TEACHER;
                            if (role === '3') return UserRoles.STUDENT;
                            if (role === '4') return UserRoles.PARENT;
                            const upperRole = role.toUpperCase();
                            return isUserRole(upperRole) ? upperRole : null;
                        })
                        .filter((role): role is UserRoles => role !== null);
                    newRole = roles[0] || null;
                } else if (typeof rawRoles === 'string') {
                    if (rawRoles === '1') newRole = UserRoles.ADMIN;
                    else if (rawRoles === '2') newRole = UserRoles.TEACHER;
                    else if (rawRoles === '3') newRole = UserRoles.STUDENT;
                    else if (rawRoles === '4') newRole = UserRoles.PARENT;
                    else {
                        const upperRole = rawRoles.toUpperCase();
                        if (isUserRole(upperRole)) {
                            newRole = upperRole;
                        }
                    }
                }

                const newSelectedAccount = decodedToken?.accountId || null;

                // Update all states synchronously
                setAccessToken(response.accessToken);
                setUserId(newUserId);
                setUserEmail(newUserEmail);
                setRole(newRole);
                setSelectedAccount(newSelectedAccount);
                setIsAuthenticated(true);

                // Update localStorage synchronously
                const authDataToPersist = {
                    isAuthenticated: true,
                    role: newRole,
                    selectedAccount: newSelectedAccount,
                    selectedBranches: [], // Will be updated later if needed
                    userEmail: newUserEmail,
                    accessToken: response.accessToken,
                    userId: newUserId,
                    timestamp: Date.now()
                };
                localStorage.setItem('authData', encryptData(authDataToPersist));
                setApiAuthData(response.accessToken, Intl.DateTimeFormat().resolvedOptions().timeZone, true);

                return true;
            }
            return false;
        } catch (error) {
            console.error('Login failed:', error);
            throw error; // Throw the error so the calling component can handle it
        }
    };

    const setAccountSelection = (accountId: string, branches: LocationModel[]) => {
        const accountToSelect = accounts.find(acc => acc.id === accountId);

        setSelectedAccount(accountId);
        // Only set branches if they are derived from the account data, otherwise use provided
        setSelectedBranches(accountToSelect ? accountToSelect.branches : branches);

        localStorage.setItem('selectedAccount', accountId);
        localStorage.setItem('selectedBranches', JSON.stringify(branches));
    };

    const logout = () => {
        // Clearing accessToken will trigger the main useEffect to clear all other states
        setAccessToken(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            role,
            login,
            logout,
            selectedAccount,
            selectedBranches,
            setAccountSelection,
            accounts,
            setAccounts,
            userEmail,
            apiClient,
            accessToken,
            userId,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
// Update your auth context (src/context/index.tsx)
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { UserRoles } from '../enums/user-roles';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (email: string, password: string) => boolean;
    role: UserRoles | null;
    logout: () => void;
    selectedAccount: string | null;
    selectedBranches: string[];
    setAccountSelection: (accountId: string, branches: string[]) => void;
    accounts: { id: string; name: string; branches: string[] }[];
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock data - replace with your actual data fetching logic
const mockAccounts = [
    { id: '1', name: 'Greenfield Academy', branches: ['Main Campus', 'North Campus', 'East Campus'] },
    { id: '2', name: 'Sunshine International', branches: ['Headquarters', 'Downtown Branch'] },
    { id: '3', name: 'Prestige High School', branches: ['Main Branch', 'Annex'] },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        const authData = localStorage.getItem('authData');
        if (authData) {
            const { isAuthenticated, timestamp } = JSON.parse(authData);
            const hasExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000;
            return isAuthenticated && !hasExpired;
        }
        return false;
    });

    const [role, setRole] = useState<UserRoles | null>(() => {
        const authData = localStorage.getItem('authData');
        if (authData) {
            return JSON.parse(authData).role || null;
        }
        return null;
    });

    const [selectedAccount, setSelectedAccount] = useState<string | null>(() => {
        const authData = localStorage.getItem('authData');
        if (authData) {
            return JSON.parse(authData).selectedAccount || null;
        }
        return null;
    });

    const [selectedBranches, setSelectedBranches] = useState<string[]>(() => {
        const authData = localStorage.getItem('authData');
        if (authData) {
            return JSON.parse(authData).selectedBranches || [];
        }
        return [];
    });

    const [accounts] = useState(mockAccounts);

    useEffect(() => {
        if (isAuthenticated) {
            localStorage.setItem(
                'authData',
                JSON.stringify({
                    isAuthenticated: true,
                    role,
                    selectedAccount,
                    selectedBranches,
                    timestamp: Date.now()
                })
            );
        }
    }, [isAuthenticated, role, selectedAccount, selectedBranches]);

    const login = (email: string, password: string) => {
        const defaultEmail = 'user@gmail.com';
        const adminEmail = 'admin@gmail.com';
        const defaultPassword = '85465955';

        if (email === defaultEmail && password === defaultPassword) {
            setIsAuthenticated(true);
            setRole(UserRoles.USER);
            setSelectedAccount(null);
            setSelectedBranches([]);
            localStorage.setItem("authData", JSON.stringify({
                isAuthenticated: true,
                role: UserRoles.USER,
                selectedAccount: null,
                selectedBranches: [],
                timestamp: Date.now()
            }));
            return true;
        } else if (email === adminEmail && password === defaultPassword) {
            setIsAuthenticated(true);
            setRole(UserRoles.ADMIN);
            setSelectedAccount(null);
            setSelectedBranches([]);
            localStorage.setItem("authData", JSON.stringify({
                isAuthenticated: true,
                role: UserRoles.ADMIN,
                selectedAccount: null,
                selectedBranches: [],
                timestamp: Date.now()
            }));
            return true;
        }
        return false;
    };

    const setAccountSelection = (accountId: string, branches: string[]) => {
        setSelectedAccount(accountId);
        setSelectedBranches(branches);
        localStorage.setItem("authData", JSON.stringify({
            isAuthenticated: true,
            role,
            selectedAccount: accountId,
            selectedBranches: branches,
            timestamp: Date.now()
        }));
    };

    const logout = () => {
        setIsAuthenticated(false);
        setRole(null);
        setSelectedAccount(null);
        setSelectedBranches([]);
        localStorage.removeItem('authData');
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
            accounts
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
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useMemo,
} from "react";
import { UserRoles } from "../enums/user-roles";
import { encryptData, decryptData } from "../utils/encryption";

import {
  createApiClient,
  createAuthClient,
  setAuthData as setApiAuthData,
  clearAuthData as clearApiAuthData,
  getCurrentUser,
  getInitialAuthData,
  parseJwt,
  type AccountModel,
  type LocationModel,
  type LoginResult,
} from "../utils/apiClient";

import { STORAGE_KEYS } from "../constants/apiConstants";
import type { CurrentUser } from "../types/apiTypes/apiTypes";

interface ContextAccount {
  id: string;
  name: string;
  branches: LocationModel[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  role: UserRoles | null;
  logout: () => void;
  selectedAccount: string | null;
  selectedBranches: LocationModel[];
  setAccountSelection: (accountId: string, branches: LocationModel[]) => void;
  accounts: ContextAccount[];
  setAccounts: (accounts: ContextAccount[]) => void;
  userEmail: string | null;
  currentUser: CurrentUser | null;
  refreshCurrentUser: () => Promise<void>;
  apiClient: ReturnType<typeof createApiClient>;
  accessToken: string | null;
  userId: string | null;
  updateRole: (newRole: UserRoles) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const initialApiAuthData = getInitialAuthData();
  const initialUser = getCurrentUser();
  const initialRole = localStorage.getItem("selectedRole") as UserRoles | null;

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!initialUser
  );
  const [role, setRole] = useState<UserRoles | null>(
    initialRole || initialUser?.roles?.[0] || null
  );
  const [selectedAccount, setSelectedAccount] = useState<string | null>(
    initialApiAuthData.selectedAccount || initialUser?.accountId || null
  );
  const [userEmail, setUserEmail] = useState<string | null>(
    initialUser?.email || null
  );
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [selectedBranches, setSelectedBranches] = useState<LocationModel[]>([]);
  const [accounts, setAccounts] = useState<ContextAccount[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(
    initialApiAuthData.accessToken
  );
  const [userId, setUserId] = useState<string | null>(
    initialUser?.userId || null
  );

  const authClient = useMemo(() => createAuthClient(), []);
  // apiClient needs to react to changes in selectedAccount and accessToken for headers
  const apiClient = useMemo(
    () => createApiClient({ selectedAccount, accessToken }),
    [selectedAccount, accessToken]
  );

  // Effect to handle initial population of selectedBranches from localStorage
  useEffect(() => {
    if (selectedAccount) {
      const storedBranches = localStorage.getItem(
        STORAGE_KEYS.SELECTED_BRANCHES
      );
      if (storedBranches) {
        try {
          const parsedBranches: LocationModel[] = JSON.parse(storedBranches);
          if (
            JSON.stringify(parsedBranches) !== JSON.stringify(selectedBranches)
          ) {
            setSelectedBranches(parsedBranches);
          }
        } catch (e) {
          console.error("Failed to parse stored branches", e);
          localStorage.removeItem(STORAGE_KEYS.SELECTED_BRANCHES);
        }
      } else {
        const acc = accounts.find((a) => a.id === selectedAccount);
        if (
          acc &&
          JSON.stringify(acc.branches) !== JSON.stringify(selectedBranches)
        ) {
          setSelectedBranches(acc.branches);
        }
      }
    }
  }, [selectedAccount, accounts, selectedBranches]);

  // Update the fetchAccounts function in the useEffect
  const fetchAccounts = async () => {
    if (userId && accessToken && role && accounts.length === 0) {
      // Added role check
      try {
        const response = await apiClient.getAccounts({
          userId,
          role: role.toString(), // Pass the current role
          page: 1,
          pageLength: 100,
        });
        const fetchedAccounts = response.items.map((account: any) => ({
          id: String(account.id),
          name: account.name,
          branches: [] as LocationModel[],
        }));

        setAccounts(fetchedAccounts);

        // Also restore selectedBranches if none exist in memory
        const selected = fetchedAccounts.find(
          (acc) => acc.id === selectedAccount
        );
        if (selected && selectedBranches.length === 0) {
          setSelectedBranches(selected.branches);
        }
      } catch (err) {
        console.error("Error fetching accounts in AuthProvider:", err);
      }
    }
  };

  // Update the dependencies array to include role
  useEffect(() => {
    fetchAccounts();
  }, [userId, accessToken, selectedAccount, accounts.length, role]); // Added role

  // Add this inside the AuthProvider component
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.SELECTED_ROLE) {
        const newRole = localStorage.getItem(
          STORAGE_KEYS.SELECTED_ROLE
        ) as UserRoles | null;
        if (newRole !== role) {
          setRole(newRole);
          // Update persisted auth data
          const authData = localStorage.getItem(STORAGE_KEYS.AUTH_DATA);
          if (authData) {
            try {
              const parsedAuthData = JSON.parse(decryptData(authData));
              localStorage.setItem(
                STORAGE_KEYS.AUTH_DATA,
                encryptData({
                  ...parsedAuthData,
                  role: newRole,
                })
              );
            } catch (error) {
              console.error("Error updating auth data:", error);
            }
          }
        }
      }
    };

    // Listen for storage changes from other tabs
    window.addEventListener("storage", handleStorageChange);

    // Also check for changes in the current tab
    const checkRole = () => {
      const currentRole = localStorage.getItem(
        STORAGE_KEYS.SELECTED_ROLE
      ) as UserRoles | null;
      if (currentRole !== role) {
        setRole(currentRole);
      }
    };

    // Check periodically (every second) for role changes
    const interval = setInterval(checkRole, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [role]); // Dependency on role to prevent unnecessary updates

  // This effect ensures core authentication details are consistent with the current token
  useEffect(() => {
    if (accessToken) {
      const currentUserDetails = getCurrentUser(); // Re-parse the token if accessToken changes

      if (currentUserDetails) {
        // Update states only if they've changed to avoid unnecessary re-renders
        if (userEmail !== currentUserDetails.email)
          setUserEmail(currentUserDetails.email);
        if (role !== (currentUserDetails.roles?.[0] || null))
          setRole(currentUserDetails.roles?.[0] || null);
        if (userId !== currentUserDetails.userId)
          setUserId(currentUserDetails.userId); // Ensure userId is always up-to-date
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
        timestamp: Date.now(),
      };
      localStorage.setItem(
        STORAGE_KEYS.AUTH_DATA,
        encryptData(authDataToPersist)
      );

      setApiAuthData(
        accessToken,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        true
      );
    } else {
      // If no accessToken, ensure all states are cleared
      if (
        isAuthenticated ||
        selectedAccount ||
        selectedBranches.length > 0 ||
        accounts.length > 0 ||
        userId ||
        userEmail ||
        role
      ) {
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
  const login = async (
    email: string,
    password: string
  ): Promise<LoginResult> => {
    try {
      const response = await authClient.login(email, password);
      if (response && response.success !== false && response.accessToken) {
        // Parse the token first
        const decodedToken = parseJwt(response.accessToken);

        // Prepare all the new state values
        const newUserId = decodedToken?.sub || null;
        const newUserEmail = decodedToken?.email || null;

        const newRole = localStorage.getItem(
          STORAGE_KEYS.SELECTED_ROLE
        ) as UserRoles | null;

        // Update state
        setRole(newRole);

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
          timestamp: Date.now(),
        };
        localStorage.setItem(
          STORAGE_KEYS.AUTH_DATA,
          encryptData(authDataToPersist)
        );
        setApiAuthData(
          response.accessToken,
          Intl.DateTimeFormat().resolvedOptions().timeZone,
          true
        );

        return response; // Return the original response without overriding message
      }

      // If login failed but returned a response (like 401), return it as-is
      return response;
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        status: 400,
        message: null,
        accessToken: undefined,
        tokenType: undefined,
        expiresIn: new Date(),
      };
    }
  };

  const refreshCurrentUser = async () => {
    if (!accessToken) return;

    try {
      const user = await apiClient.getCurrentUser();
      setCurrentUser(user);

      // Optional: cache it
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, encryptData(user));
    } catch (error) {
      console.error("Failed to fetch current user", error);
    }
  };

  useEffect(() => {
    if (!accessToken) {
      setCurrentUser(null);
      return;
    }

    // 1️⃣ Try localStorage first
    const cachedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (cachedUser) {
      try {
        setCurrentUser(JSON.parse(decryptData(cachedUser)));
      } catch {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    }

    // 2️⃣ Always refresh from API (authoritative)
    refreshCurrentUser();
  }, [accessToken]);

  // Inside the AuthProvider component
  const updateRole = (newRole: UserRoles) => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_ROLE, newRole);
    setRole(newRole);
    // Trigger a custom event to notify other hooks in the same tab
    window.dispatchEvent(new Event("localStorageRoleUpdated"));
  };

  const setAccountSelection = (
    accountId: string,
    branches: LocationModel[]
  ) => {
    const accountToSelect = accounts.find((acc) => acc.id === accountId);

    setSelectedAccount(accountId);
    // Only set branches if they are derived from the account data, otherwise use provided
    setSelectedBranches(accountToSelect ? accountToSelect.branches : branches);

    localStorage.setItem(STORAGE_KEYS.SELECTED_ACCOUNT, accountId);
    localStorage.setItem(
      STORAGE_KEYS.SELECTED_BRANCHES,
      JSON.stringify(branches)
    );
  };

  const logout = () => {
    // Clearing accessToken will trigger the main useEffect to clear all other states
    setAccessToken(null);
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  };

  return (
    <AuthContext.Provider
      value={{
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
        currentUser,
        refreshCurrentUser,
        apiClient,
        accessToken,
        userId,
        updateRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

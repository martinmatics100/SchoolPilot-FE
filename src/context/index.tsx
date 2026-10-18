import {
  createContext,
  useContext,
  useState,
  useCallback,
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
  extractRoleFromToken,
  parseJwt,
  type LocationModel,
  type LoginResult,
} from "../utils/apiClient";

import { STORAGE_KEYS } from "../constants/apiConstants";
import type { CurrentUser } from "../types/apiTypes/apiTypes";
import { logoutUser } from "../api/userService";
import { stopChatConnection } from "../api/signalRService";

interface ContextAccount {
  id: string;
  name: string;
  branches: LocationModel[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  role: UserRoles | null;
  logout: () => Promise<void>;
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
  chatUserId: string | null;
  updateRole: (newRole: UserRoles) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const initialApiAuthData = getInitialAuthData();
  const initialUser = getCurrentUser();
  const initialRole = localStorage.getItem("selectedRole") as UserRoles | null;

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!initialUser);
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
  const [chatUserId, setChatUserId] = useState<string | null>(
    initialUser?.chatUserId || null
  );

  const authClient = useMemo(() => createAuthClient(), []);
  const apiClient = useMemo(
    () => createApiClient({ selectedAccount, accessToken }),
    [selectedAccount, accessToken]
  );

  // Restore branches from localStorage
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

  const fetchAccounts = async () => {
    if (role === UserRoles.SUPER_ADMIN) return;

    if (userId && accessToken && role && accounts.length === 0) {
      try {
        const response = await apiClient.getAccounts({
          userId,
          role: role.toString(),
          page: 1,
          pageLength: 100,
        });
        const fetchedAccounts = response.items.map((account: any) => ({
          id: String(account.id),
          name: account.name,
          branches: [] as LocationModel[],
        }));

        setAccounts(fetchedAccounts);

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

  useEffect(() => {
    fetchAccounts();
  }, [userId, accessToken, selectedAccount, accounts.length, role]);

  // Cross-tab role sync
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.SELECTED_ROLE) {
        const newRole = localStorage.getItem(
          STORAGE_KEYS.SELECTED_ROLE
        ) as UserRoles | null;
        if (newRole !== role) {
          setRole(newRole);
          const authData = localStorage.getItem(STORAGE_KEYS.AUTH_DATA);
          if (authData) {
            try {
              const parsedAuthData = JSON.parse(decryptData(authData));
              localStorage.setItem(
                STORAGE_KEYS.AUTH_DATA,
                encryptData({ ...parsedAuthData, role: newRole })
              );
            } catch (error) {
              console.error("Error updating auth data:", error);
            }
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    const checkRole = () => {
      const currentRole = localStorage.getItem(
        STORAGE_KEYS.SELECTED_ROLE
      ) as UserRoles | null;
      if (currentRole !== role) {
        setRole(currentRole);
      }
    };

    const interval = setInterval(checkRole, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [role]);

  // Keep auth state in sync with the token
  useEffect(() => {
    if (accessToken) {
      const currentUserDetails = getCurrentUser();

      if (currentUserDetails) {
        if (userEmail !== currentUserDetails.email)
          setUserEmail(currentUserDetails.email);
        if (role !== (currentUserDetails.roles?.[0] || null))
          setRole(currentUserDetails.roles?.[0] || null);
        if (userId !== currentUserDetails.userId)
          setUserId(currentUserDetails.userId);
        if (chatUserId !== currentUserDetails.chatUserId)
          setChatUserId(currentUserDetails.chatUserId);
        if (isAuthenticated !== true) setIsAuthenticated(true);
      } else {
        if (isAuthenticated) setIsAuthenticated(false);
        clearApiAuthData();
      }

      const authDataToPersist = {
        isAuthenticated,
        role,
        selectedAccount,
        selectedBranches,
        userEmail,
        accessToken,
        userId,
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
      // Token gone — tear down the SignalR socket too.
      stopChatConnection().catch(() => { });

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
        setChatUserId(null);
        setAccounts([]);
        clearApiAuthData();
      }
    }
  }, [accessToken]);

  const login = async (
    email: string,
    password: string
  ): Promise<LoginResult> => {
    try {
      const response = await authClient.login(email, password);
      if (response && response.success !== false && response.accessToken) {
        const decodedToken = parseJwt(response.accessToken);

        const newUserId = decodedToken?.sub || null;
        const newUserEmail = decodedToken?.email || null;

        const roleFromStorage = localStorage.getItem(
          STORAGE_KEYS.SELECTED_ROLE
        ) as UserRoles | null;
        const roleFromToken = extractRoleFromToken(decodedToken);
        const newRole = roleFromStorage ?? roleFromToken;

        setRole(newRole);

        const newSelectedAccount = decodedToken?.accountId || null;

        setAccessToken(response.accessToken);
        setUserId(newUserId);
        setUserEmail(newUserEmail);
        setRole(newRole);
        setSelectedAccount(newSelectedAccount);
        setIsAuthenticated(true);

        const authDataToPersist = {
          isAuthenticated: true,
          role: newRole,
          selectedAccount: newSelectedAccount,
          selectedBranches: [],
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

        return response;
      }

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

    const cachedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (cachedUser) {
      try {
        setCurrentUser(JSON.parse(decryptData(cachedUser)));
      } catch {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    }

    refreshCurrentUser();
  }, [accessToken]);

  const updateRole = (newRole: UserRoles) => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_ROLE, newRole);
    setRole(newRole);
    window.dispatchEvent(new Event("localStorageRoleUpdated"));
  };

  const setAccountSelection = (
    accountId: string,
    branches: LocationModel[]
  ) => {
    const accountToSelect = accounts.find((acc) => acc.id === accountId);

    setSelectedAccount(accountId);
    setSelectedBranches(accountToSelect ? accountToSelect.branches : branches);

    localStorage.setItem(STORAGE_KEYS.SELECTED_ACCOUNT, accountId);
    localStorage.setItem(
      STORAGE_KEYS.SELECTED_BRANCHES,
      JSON.stringify(branches)
    );
  };

  const logout = useCallback(async () => {
    try {
      await logoutUser(apiClient);
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      // ── Close the SignalR socket first ──
      try {
        await stopChatConnection();
      } catch (err) {
        console.error("Failed to stop SignalR connection", err);
      }

      // Clear local auth state
      setIsAuthenticated(false);
      setRole(null);
      setSelectedAccount(null);
      setSelectedBranches([]);
      setUserEmail(null);
      setUserId(null);
      setChatUserId(null);
      setAccounts([]);
      setAccessToken(null);
      setCurrentUser(null);

      // Clear persisted auth data
      localStorage.removeItem(STORAGE_KEYS.AUTH_DATA);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.SELECTED_ROLE);
      localStorage.removeItem(STORAGE_KEYS.SELECTED_ACCOUNT);
      localStorage.removeItem(STORAGE_KEYS.SELECTED_BRANCHES);
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);

      // Chat-specific UI state, so next login starts fresh.
      localStorage.removeItem("chat.activeRoomId");
      localStorage.removeItem("chat.drafts");
    }
  }, [apiClient]);

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
        chatUserId,
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
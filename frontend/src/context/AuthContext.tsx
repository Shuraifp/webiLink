"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { refreshAdminToken } from "@/lib/api/admin/authApi";
import { refreshUserToken } from "@/lib/api/user/authApi";
import { AdminState, AuthState, AuthStatus, USER_ROLE, UserData } from "@/types/type";
import { disconnectSocket, getSocket } from "@/lib/socket";
import { Socket } from "socket.io-client";
import toast from "react-hot-toast";


const AuthContext = createContext<{
  auth: AuthState;
  admin: AdminState;
  login: (
    user: UserData,
    authStatus: AuthStatus,
    refreshToken?: string
  ) => void;
  logout: () => void;
  loginAdmin: (
    user: UserData,
    authStatus: AuthStatus,
    refreshToken?: string
  ) => void;
  logoutAdmin: () => void;
}>({
  auth: { user: null, authStatus: null, isLoading: true },
  admin: { admin: null, adminStatus: null, isLoading: true },
  login: () => {},
  logout: () => {},
  loginAdmin: () => {},
  logoutAdmin: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    authStatus: null,
    isLoading: true,
  });
  const [admin, setAdmin] = useState<AdminState>({
    admin: null,
    adminStatus: null,
    isLoading: true,
  });
  const socketRef = useRef<Socket>(getSocket());
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("webiUser");
    const storedAuthStatus = localStorage.getItem("webiAuthStatus");
    const storedAdmin = localStorage.getItem("webiAdmin");
    const storedAdminStatus = localStorage.getItem("webiAdminStatus");
    if (storedUser && storedAuthStatus) {
      try {
        const user = JSON.parse(storedUser) as UserData;
        const authStatus = JSON.parse(storedAuthStatus) as AuthStatus;
        if (authStatus.expiresAt > Date.now()) {
          setAuth({ user, authStatus, isLoading: false });
        } else {
          refreshToken("user").catch(() => logout());
        }
      } catch {
        logout();
      }
    } else {
      setAuth({ user: null, authStatus: null, isLoading: false });
    }

    if (storedAdmin && storedAdminStatus) {
      try {
        const user = JSON.parse(storedAdmin) as UserData;
        const authStatus = JSON.parse(storedAdminStatus) as AuthStatus;
        if (authStatus.expiresAt > Date.now()) {
          setAdmin({ admin: user, adminStatus: authStatus, isLoading: false });
        } else {
          refreshToken("admin").catch(() => logoutAdmin());
        }
      } catch {
        logoutAdmin();
      }
    } else {
      setAdmin({ admin: null, adminStatus: null, isLoading: false });
    }
  }, []);

  useEffect(() => {
    if (!auth.user?.id || typeof window === "undefined") return;

    const socket = socketRef.current;
    if (!socket.connected) {
      socket.connect();
    }

    const handleNotification = ({
      type,
      message,
      data,
    }: {
      type: string;
      message: string;
      data?: {
        recordingId?: string;
        planId?: string;
      };
    }) => {
      toast.success(message);
      console.log(`Notification received: ${type}`, data);
    };

    const handleConnect = () => {
      socket.emit("register-user", { userId: auth.user!.id });
    };

    socket.on("notification", handleNotification);
    socket.on("connect", handleConnect);

    return () => {
      socket.off("notification", handleNotification);
      socket.off("connect", handleConnect);
      disconnectSocket();
    };
  }, [auth.user?.id]);

  const login = (user: UserData, authStatus: AuthStatus) => {
    localStorage.setItem("webiUser", JSON.stringify(user));
    localStorage.setItem("webiAuthStatus", JSON.stringify(authStatus));
    setAuth({ user, authStatus, isLoading: false });
  };

  const loginAdmin = (user: UserData, authStatus: AuthStatus) => {
    localStorage.setItem("webiAdmin", JSON.stringify(user));
    localStorage.setItem("webiAdminStatus", JSON.stringify(authStatus));
    setAdmin({ admin: user, adminStatus: authStatus, isLoading: false });
  };

  const logout = () => {
    localStorage.removeItem("webiUser");
    localStorage.removeItem("webiAuthStatus");
    setAuth({ user: null, authStatus: null, isLoading: false });
    if (socketRef.current) {
      disconnectSocket();
      // socketRef.current = null;
    }
    router.push("/login");
  };

  const logoutAdmin = () => {
    localStorage.removeItem("webiAdmin");
    localStorage.removeItem("webiAdminStatus");
    setAdmin({ admin: null, adminStatus: null, isLoading: false });
    router.push("/admin/auth/login");
  };

  const refreshToken = async (
    userRole: (typeof USER_ROLE)[keyof typeof USER_ROLE]
  ) => {
    try {
      if (userRole === "admin") {
        const res = await refreshAdminToken();
        loginAdmin(res.webiAdmin, res.webiAdminStatus);
      } else if (userRole === "user") {
        const res = await refreshUserToken();
        login(res.webiUser, res.webiAuthStatus);
      }
    } catch {
      if (userRole === "admin") {
        logoutAdmin();
      } else {
        logout();
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{ auth, admin, login, logout, loginAdmin, logoutAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

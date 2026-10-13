/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, getToken, setToken } from "../service/apiClient.js";

const AuthContext = createContext(null);
const USER_KEY = "pulseops-user";

function loadUser() {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(loadUser);
    const [token, setTokenState] = useState(() => getToken());
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        // apiRequest broadcasts a 401 so every protected screen drops its
        // cached identity and the route guard can send the user to sign in.
        const onUnauthorized = () => {
            setTokenState(null);
            setUser(null);
            try {
                localStorage.removeItem(USER_KEY);
            } catch { /* ignore */ }
        };
        window.addEventListener("pulseops:unauthorized", onUnauthorized);
        return () => window.removeEventListener("pulseops:unauthorized", onUnauthorized);
    }, []);

    const persist = useCallback((nextToken, nextUser) => {
        // Keep the in-memory session and browser storage aligned across reloads.
        setToken(nextToken);
        setTokenState(nextToken);
        setUser(nextUser);
        try {
            if (nextUser) localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
            else localStorage.removeItem(USER_KEY);
        } catch { /* ignore */ }
    }, []);

    const login = useCallback(async (email, password) => {
        setAuthLoading(true);
        setAuthError(null);
        try {
            const result = await api.login({ email, password });
            persist(result.token, result.user);
            return result.user;
        } catch (error) {
            setAuthError(error.message);
            throw error;
        } finally {
            setAuthLoading(false);
        }
    }, [persist]);

    const register = useCallback(async (name, email, password) => {
        setAuthLoading(true);
        setAuthError(null);
        try {
            const result = await api.register({ name, email, password });
            persist(result.token, result.user);
            return result.user;
        } catch (error) {
            setAuthError(error.message);
            throw error;
        } finally {
            setAuthLoading(false);
        }
    }, [persist]);

    const logout = useCallback(() => {
        persist(null, null);
    }, [persist]);

    const updateProfile = useCallback(async (name) => {
        const updated = await api.updateProfile({ name });
        setUser((current) => {
            const next = current ? { ...current, name: updated.name } : updated;
            try {
                localStorage.setItem(USER_KEY, JSON.stringify(next));
            } catch { /* ignore */ }
            return next;
        });
        return updated;
    }, []);

    const value = useMemo(() => ({
        user,
        token,
        isLoggedIn: Boolean(token),
        authLoading,
        authError,
        login,
        register,
        logout,
        updateProfile,
    }), [user, token, authLoading, authError, login, register, logout, updateProfile]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const value = useContext(AuthContext);
    if (!value) throw new Error("useAuth must be used inside AuthProvider");
    return value;
}

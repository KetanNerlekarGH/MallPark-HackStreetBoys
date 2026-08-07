import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAccessToken, setAccessToken, removeAccessToken } from '@/api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
    const [authError, setAuthError] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [appPublicSettings, setAppPublicSettings] = useState(null);

    useEffect(() => {
        checkUserAuth();
    }, []);

    const checkUserAuth = async () => {
        try {
            setIsLoadingAuth(true);
            setAuthError(null);
            const token = getAccessToken();
            const storedUser = localStorage.getItem('auth_user');

            if (token && storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    setIsAuthenticated(true);
                } catch (e) {
                    // Invalid JSON in localStorage
                    removeAccessToken();
                    localStorage.removeItem('auth_user');
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } else if (token) {
                // Token exists without cached user data
                setUser({ username: 'Authenticated User' });
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('User auth check error:', error);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoadingAuth(false);
            setAuthChecked(true);
        }
    };

    const login = (userData, token) => {
        if (token) {
            setAccessToken(token);
        }
        if (userData) {
            localStorage.setItem('auth_user', JSON.stringify(userData));
            setUser(userData);
        }
        setIsAuthenticated(true);
        setAuthChecked(true);
        setAuthError(null);
    };

    const logout = (redirect = true) => {
        setUser(null);
        setIsAuthenticated(false);
        removeAccessToken();
        localStorage.removeItem('auth_user');
        localStorage.removeItem('base44_mock_user');

        if (redirect) {
            window.location.href = '/login';
        }
    };

    const navigateToLogin = () => {
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isLoadingAuth,
            isLoadingPublicSettings,
            authError,
            appPublicSettings,
            authChecked,
            login,
            logout,
            navigateToLogin,
            checkUserAuth,
            checkAppState: checkUserAuth
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

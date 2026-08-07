import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { createAxiosClient } from '@base44/sdk/dist/utils/axios-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
    const [authError, setAuthError] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }

    useEffect(() => {
        checkAppState();
    }, []);

    const checkAppState = async () => {
        try {
            setIsLoadingPublicSettings(true);
            setAuthError(null);

            // Check if mock/local user exists in localStorage
            const storedMockUser = localStorage.getItem('base44_mock_user');

            if (appParams.appId) {
                const appClient = createAxiosClient({
                    baseURL: `/api/apps/public`,
                    headers: {
                        'X-App-Id': appParams.appId
                    },
                    token: appParams.token,
                    interceptResponses: true
                });

                try {
                    const publicSettings = await appClient.get(`/prod/public-settings/by-id/${appParams.appId}`);
                    setAppPublicSettings(publicSettings);

                    if (appParams.token) {
                        await checkUserAuth();
                    } else if (storedMockUser) {
                        setUser(JSON.parse(storedMockUser));
                        setIsAuthenticated(true);
                        setAuthChecked(true);
                        setIsLoadingAuth(false);
                    } else {
                        setIsLoadingAuth(false);
                        setIsAuthenticated(false);
                        setAuthChecked(true);
                    }
                    setIsLoadingPublicSettings(false);
                    return;
                } catch (appError) {
                    console.warn('App state check notice (using local mode):', appError);
                }
            }

            // Fallback for local standalone mode
            if (storedMockUser) {
                try {
                    setUser(JSON.parse(storedMockUser));
                    setIsAuthenticated(true);
                } catch (e) {
                    setIsAuthenticated(false);
                }
            } else {
                setIsAuthenticated(false);
            }
            setAuthChecked(true);
            setIsLoadingPublicSettings(false);
            setIsLoadingAuth(false);
        } catch (error) {
            console.error('Unexpected error:', error);
            setIsAuthenticated(false);
            setAuthChecked(true);
            setIsLoadingPublicSettings(false);
            setIsLoadingAuth(false);
        }
    };

    const checkUserAuth = async () => {
        try {
            // Now check if the user is authenticated
            setIsLoadingAuth(true);
            const currentUser = await base44.auth.me();
            setUser(currentUser);
            setIsAuthenticated(true);
            setIsLoadingAuth(false);
            setAuthChecked(true);
        } catch (error) {
            console.error('User auth check failed:', error);
            setIsLoadingAuth(false);
            setIsAuthenticated(false);
            setAuthChecked(true);

            // If user auth fails, it might be an expired token
            if (error.status === 401 || error.status === 403) {
                setAuthError({
                    type: 'auth_required',
                    message: 'Authentication required'
                });
            }
        }
    };

    const logout = (shouldRedirect = true) => {
        setUser(null);
        setIsAuthenticated(false);
        try {
            localStorage.removeItem('base44_mock_user');
        } catch (e) {}

        if (shouldRedirect) {
            base44.auth.logout(window.location.href);
        } else {
            base44.auth.logout();
        }
    };

    const navigateToLogin = () => {
        // Use the SDK's redirectToLogin method
        base44.auth.redirectToLogin(window.location.href);
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
            logout,
            navigateToLogin,
            checkUserAuth,
            checkAppState
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

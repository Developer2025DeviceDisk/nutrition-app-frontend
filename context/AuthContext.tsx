import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
    token: string | null;
    user: any | null;
    setAuth: (token: string, user: any) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (newUser: any) => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load stored auth data on mount
        const loadAuthData = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('auth_token');
                const storedUser = await AsyncStorage.getItem('auth_user');

                if (storedToken && storedUser) {
                    try {
                        const parsedUser = JSON.parse(storedUser);
                        setToken(storedToken);
                        setUser(parsedUser);
                        console.log('Auth data loaded successfully');
                    } catch (parseError) {
                        console.error('Failed to parse stored user data:', parseError);
                        // Clear corrupted data
                        await AsyncStorage.removeItem('auth_token');
                        await AsyncStorage.removeItem('auth_user');
                    }
                }
            } catch (error) {
                console.error('Failed to load auth data from storage:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadAuthData();
    }, []);

    const setAuth = async (newToken: string, newUser: any) => {
        try {
            await AsyncStorage.setItem('auth_token', newToken);
            await AsyncStorage.setItem('auth_user', JSON.stringify(newUser));
            setToken(newToken);
            setUser(newUser);
        } catch (error) {
            console.error('Failed to save auth data:', error);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('auth_token');
            await AsyncStorage.removeItem('auth_user');
            setToken(null);
            setUser(null);
        } catch (error) {
            console.error('Failed to clear auth data:', error);
        }
    };

    const updateUser = async (newUser: any) => {
        try {
            await AsyncStorage.setItem('auth_user', JSON.stringify(newUser));
            setUser(newUser);
        } catch (error) {
            console.error('Failed to update user data:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ token, user, setAuth, logout, updateUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

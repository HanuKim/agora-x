import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * useAuth
 *
 * Custom hook to access authentication state and actions.
 * Must be used within <AuthProvider>.
 *
 * @example
 *   const { user, login, logout, isAuthenticated } = useAuth();
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

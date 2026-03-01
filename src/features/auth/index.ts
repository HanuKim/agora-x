/**
 * features/auth — public API (barrel)
 *
 * All external code imports auth primitives from here.
 * Do NOT import from deep sub-paths outside of features/auth.
 *
 * @example
 *   import { useAuth, AuthProvider, LoginModal, ProtectedRoute } from '../features/auth';
 */
export { AuthProvider } from './context/AuthContext';
export type { User, AuthContextType } from './context/AuthContext';

export { useAuth } from './hooks/useAuth';

export { LoginModal } from './components/LoginModal';
export { ProtectedRoute } from './components/ProtectedRoute';

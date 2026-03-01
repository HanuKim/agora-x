/**
 * features/auth — public API (barrel)
 *
 * Exports:
 *  - Business logic: AuthProvider, useAuth (context & hooks)
 *  - UI components: LoginModal, ProtectedRoute (re-exported from components/auth/)
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

// UI components live in components/auth/ — re-exported here for a single import surface
export { LoginModal } from '../../components/auth/LoginModal';
export { ProtectedRoute } from '../../components/auth/ProtectedRoute';

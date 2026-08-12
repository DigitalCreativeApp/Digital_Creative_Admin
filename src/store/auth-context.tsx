import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AdminUser } from '../types/admin.types';
import * as auth from '../services/auth.service';

type AuthState = { user: AdminUser | null; loading: boolean; signIn: (email: string, password: string) => Promise<void>; signOut: () => Promise<void> };
const AuthContext = createContext<AuthState | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { auth.currentUser().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false)); }, []);
  return <AuthContext.Provider value={{ user, loading, signIn: async (e, p) => setUser(await auth.login(e, p)), signOut: async () => { await auth.logout(); setUser(null); } }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('AuthProvider is missing'); return value; }

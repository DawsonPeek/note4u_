import { useState, createContext, useContext, ReactNode } from 'react';
import { authService } from '@/lib/auth';
import { RegisterRequest, User } from '@/types/user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  role: string;
  login: (email: string, password: string) => Promise<{ user?: User }>;
  register: (userData: RegisterRequest) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(authService.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [role, setRole] = useState<string>(authService.getRole());
  const [loading, setLoading] = useState(false);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const result = await authService.login(username, password);
      if (result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        setRole(result.user.role || '');
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    setLoading(true);
    try {
      await authService.register(userData);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setRole('');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
    }
  };

  const value = { user, isAuthenticated, role, login, register, logout, updateUser, loading};

  return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('Errore authProvider');
  }
  return context;
}
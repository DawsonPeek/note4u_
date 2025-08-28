import {User, RegisterRequest} from '@/types/user';
import { apiService } from './api';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
  unique_name: string;
  nameid: string;
  given_name: string;
  family_name: string;
  email: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  role: string;
}

class AuthService {
  private state: AuthState = {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    role: '',
  };

  constructor() {
    this.checkAuthStatus();
  }

  private checkAuthStatus() {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token) {
      try {
        const decodedToken: DecodedToken = jwtDecode(token);

        if (decodedToken.exp * 1000 < Date.now()) {
          console.warn("Sessione scaduta. Effettua nuovamente il login.");
          this.logout();
          return;
        }

        let user: User | null = null;

        if (savedUser) {
          try {
            user = JSON.parse(savedUser);
          } catch (error) {
            console.warn("Errore nel parsing dell'utente salvato:", error);
          }
        }

        if (!user) {
          const username = decodedToken.unique_name;
          const id = decodedToken.nameid;
          const role = decodedToken.role;
          const firstName = decodedToken.given_name;
          const lastName = decodedToken.family_name;
          const email = decodedToken.email;

          user = username && id ? {
            id,
            username,
            firstName,
            lastName,
            email,
            role,
          } : null;
        }

        this.state = {
          user: user,
          token: token,
          isAuthenticated: !!user,
          role: user?.role || decodedToken.role || '',
        };

      } catch (error) {
        console.error("Errore token:", error);
        this.logout();
      }
    } else {
      this.logout();
    }
  }

  async login(username: string, password: string): Promise<{ user?: User}> {
    const result = await apiService.login(username, password);
    localStorage.setItem('token', result);
    this.checkAuthStatus();
    return { user: this.state.user };
  }

  async register(userData : RegisterRequest): Promise<void> {
    await apiService.register(userData);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.state.user = null;
    this.state.token = null;
    this.state.isAuthenticated = false;
    this.state.role = '';
  }

  getUser(): User | null {
    return this.state.user;
  }

  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  getRole(): string {
    return this.state.role;
  }
}

export const authService = new AuthService();
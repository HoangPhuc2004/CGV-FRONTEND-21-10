import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// --- Định nghĩa kiểu dữ liệu ---
interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  memberSince?: string;
}
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  register: (name: string, email: string, password: string) => Promise<any>;
  login: (email: string, password: string, name?: string) => Promise<any>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

// --- Tạo Context ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Auth Provider Component ---
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const API_URL = 'http://localhost:5001/api';

  const fetchUser = useCallback(async () => {
    const savedToken = localStorage.getItem('cgv_token');
    if (savedToken) {
      try {
        const response = await fetch(`${API_URL}/users/me`, {
          headers: { 'Authorization': `Bearer ${savedToken}` }
        });
        if (response.ok) {
            const userData = await response.json();
            const currentUser = { id: userData.user_id, name: userData.username, email: userData.email, phone: userData.phone, memberSince: new Date().toLocaleDateString('vi-VN') };
            setUser(currentUser);
            setToken(savedToken);
            localStorage.setItem('cgv_user', JSON.stringify(currentUser));
        } else {
            logout(); // Token không hợp lệ, đăng xuất
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        logout();
      }
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const register = async (name: string, email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  };
  
  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('cgv_token', data.token);
      await fetchUser(); // Tải lại thông tin user sau khi có token
    }
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cgv_user');
    localStorage.removeItem('cgv_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        register,
        login,
        logout,
        fetchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// --- Custom Hook ---
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
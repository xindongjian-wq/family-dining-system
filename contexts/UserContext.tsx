'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface UserContextType {
  userName: string;
  setUserName: (name: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userName, setUserNameState] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 从 localStorage 读取用户名
  useEffect(() => {
    const stored = localStorage.getItem('family_dining_user');
    if (stored) {
      setUserNameState(stored);
      setIsLoggedIn(true);
    }
  }, []);

  const setUserName = (name: string) => {
    setUserNameState(name);
    localStorage.setItem('family_dining_user', name);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setUserNameState('');
    localStorage.removeItem('family_dining_user');
    setIsLoggedIn(false);
  };

  return (
    <UserContext.Provider value={{ userName, setUserName, logout, isLoggedIn }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}

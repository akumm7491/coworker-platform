import React, { createContext, useContext, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import LoginModal from '@/components/auth/LoginModal';
import SignupModal from '@/components/auth/SignupModal';

interface AuthContextType {
  openLogin: () => void;
  openSignup: () => void;
  closeModals: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const openLogin = useCallback(() => {
    setIsLoginOpen(true);
    setIsSignupOpen(false);
  }, []);

  const openSignup = useCallback(() => {
    setIsSignupOpen(true);
    setIsLoginOpen(false);
  }, []);

  const closeModals = useCallback(() => {
    setIsLoginOpen(false);
    setIsSignupOpen(false);
  }, []);

  return (
    <AuthContext.Provider value={{ openLogin, openSignup, closeModals }}>
      {children}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={closeModals}
        onSignupClick={openSignup}
      />
      <SignupModal 
        isOpen={isSignupOpen} 
        onClose={closeModals}
        onLoginClick={openLogin}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

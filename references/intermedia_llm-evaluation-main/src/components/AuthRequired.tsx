import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthForm } from './AuthForm';

export function AuthRequired({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return <AuthForm />;
  }

  return <>{children}</>;
}
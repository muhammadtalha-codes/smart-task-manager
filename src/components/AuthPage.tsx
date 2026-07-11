import { useState } from 'react';
import { LoginPage } from './LoginPage';
import { SignUpPage } from './SignUpPage';

export function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);

  return isSignUp ? (
    <SignUpPage onToggleSignUp={() => setIsSignUp(false)} />
  ) : (
    <LoginPage onToggleSignUp={() => setIsSignUp(true)} />
  );
}

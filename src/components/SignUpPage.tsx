import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, CircleAlert as AlertCircle, CircleCheck as CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface SignUpPageProps {
  onToggleSignUp: () => void;
}

export function SignUpPage({ onToggleSignUp }: SignUpPageProps) {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    const { error: authError } = await signUp(email, password);

    if (authError) {
      setError(authError);
      setLoading(false);
    } else {
      setShowVerification(true);
    }
  };

  if (showVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-chart-2" />
            </div>
            <CardTitle>Account created</CardTitle>
            <CardDescription>
              Check your email to verify your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We've sent a verification link to <strong>{email}</strong>. Click the link to verify your account and start using TaskFlow.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Back to home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">TaskFlow</h1>
          </div>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Sign up to start managing your tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-confirm-password">Confirm Password</Label>
              <Input
                id="signup-confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !email || !password || !confirmPassword}
            >
              {loading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Creating account...
                </>
              ) : (
                'Sign Up'
              )}
            </Button>

            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onToggleSignUp}
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

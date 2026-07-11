import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, CircleAlert as AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface LoginPageProps {
  onToggleSignUp: () => void;
}

export function LoginPage({ onToggleSignUp }: LoginPageProps) {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await signIn(email, password);

    if (authError) {
      setError(authError);
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  if (showForgotPassword) {
    return <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />;
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
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Enter your credentials to access your tasks</CardDescription>
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !email || !password}
            >
              {loading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="text-sm text-center text-muted-foreground space-y-2">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="block w-full text-primary hover:underline"
              >
                Forgot password?
              </button>
              <div>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onToggleSignUp}
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: resetError } = await resetPassword(email);

    if (resetError) {
      setError(resetError);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We've sent a password reset link to {email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} variant="outline" className="w-full">
              Back to login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>Enter your email to receive a reset link</CardDescription>
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
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !email}
            >
              {loading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Sending...
                </>
              ) : (
                'Send reset link'
              )}
            </Button>

            <Button onClick={onBack} variant="outline" className="w-full">
              Back to login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

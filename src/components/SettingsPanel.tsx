import { useState } from 'react';
import { Download, CloudDownload as DownloadCloud, Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { useTheme } from '@/components/theme-provider';
import { useAuth } from '@/lib/auth';
import { exportUserData, downloadAsJSON, downloadAsCSV } from '@/lib/export';
import { useApp } from '@/store';

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { state } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleExportJSON = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = await exportUserData(user.id);
      downloadAsJSON(data, `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`);
      setSuccess('Backup exported successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export backup');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    try {
      downloadAsCSV(
        state.tasks,
        `taskflow-tasks-${new Date().toISOString().split('T')[0]}.csv`
      );
      setSuccess('Tasks exported as CSV!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export CSV');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription>Manage your preferences and data</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Theme */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Appearance</h3>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Dark Mode</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={theme === 'light' ? 'secondary' : 'ghost'}
                  onClick={() => setTheme('light')}
                >
                  Light
                </Button>
                <Button
                  size="sm"
                  variant={theme === 'dark' ? 'secondary' : 'ghost'}
                  onClick={() => setTheme('dark')}
                >
                  Dark
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Data Export */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Data Export</h3>
            <p className="text-xs text-muted-foreground">
              Download your data as backup or to import elsewhere
            </p>

            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-chart-2 bg-chart-2/5">
                <AlertDescription className="text-xs">{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Button
                onClick={handleExportJSON}
                disabled={loading}
                className="w-full justify-start"
                variant="outline"
              >
                {loading ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Full Backup (JSON)
              </Button>

              <Button
                onClick={handleExportCSV}
                disabled={loading || state.tasks.length === 0}
                className="w-full justify-start"
                variant="outline"
              >
                <DownloadCloud className="mr-2 h-4 w-4" />
                Export Tasks (CSV)
              </Button>
            </div>

            <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
              💡 Full backups include all your tasks and goals. CSV exports are great for spreadsheets.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

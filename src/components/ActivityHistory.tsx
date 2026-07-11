import { useState, useEffect } from 'react';
import { Trash2, Loader as Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface ActivityLog {
  id: string;
  action: string;
  entity_type: string;
  entity_name: string;
  created_at: string;
}

interface ActivityHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ACTION_ICONS: Record<string, string> = {
  created: '✨',
  updated: '✏️',
  deleted: '🗑️',
  completed: '✅',
  reopened: '🔄',
};


export function ActivityHistory({ open, onOpenChange }: ActivityHistoryProps) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchActivityLogs();
    }
  }, [open, user]);

  const fetchActivityLogs = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!user) return;
    setClearing(true);

    try {
      const { error } = await supabase
        .from('activity_logs')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setLogs([]);
      setShowClearDialog(false);
    } catch (err) {
      console.error('Failed to clear history:', err);
    } finally {
      setClearing(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Activity History</DialogTitle>
            <DialogDescription>Recent actions on your tasks and goals</DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <Alert className="border-muted bg-muted/50">
              <AlertDescription>No activity yet. Create your first task to get started!</AlertDescription>
            </Alert>
          ) : (
            <>
              <ScrollArea className="h-96 pr-4">
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 rounded-lg border border-border p-3 text-sm transition-colors hover:bg-muted/50"
                    >
                      <span className="text-lg">{ACTION_ICONS[log.action] || '•'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground capitalize">
                          {log.action} {log.entity_type}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{log.entity_name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatTime(log.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Button
                  onClick={() => fetchActivityLogs()}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Refresh
                </Button>
                <Button
                  onClick={() => setShowClearDialog(true)}
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all activity?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all your activity history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction
            onClick={handleClearHistory}
            disabled={clearing}
            className="bg-destructive hover:bg-destructive/90"
          >
            {clearing ? 'Clearing...' : 'Clear all'}
          </AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

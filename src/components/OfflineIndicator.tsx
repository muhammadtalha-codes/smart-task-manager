import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
        <WifiOff className="h-4 w-4 animate-pulse" />
        <span>You are offline. Changes will sync when back online.</span>
      </div>
    </div>
  );
}

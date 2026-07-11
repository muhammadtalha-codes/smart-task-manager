import { useEffect } from 'react';

interface ShortcutHandlers {
  onNewTask?: () => void;
  onSearch?: () => void;
  onGoals?: () => void;
  onDashboard?: () => void;
  onUndo?: () => void;
  onShowHelp?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (isTyping) return;

      // N: New task
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        handlers.onNewTask?.();
      }

      // /: Focus search
      if (e.key === '/') {
        e.preventDefault();
        handlers.onSearch?.();
      }

      // G: Goals
      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        handlers.onGoals?.();
      }

      // D: Dashboard
      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handlers.onDashboard?.();
      }

      // Ctrl/Cmd + Z: Undo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        handlers.onUndo?.();
      }

      // ?: Show help
      if ((e.shiftKey && e.key === '?') || e.key === '?') {
        e.preventDefault();
        handlers.onShowHelp?.();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handlers]);
}

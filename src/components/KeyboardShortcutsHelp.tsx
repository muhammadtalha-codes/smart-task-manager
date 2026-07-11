import { Circle as HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Kbd } from '@/components/ui/kbd';

interface Shortcut {
  key: string;
  description: string;
  keys: string[];
}

const SHORTCUTS: Shortcut[] = [
  {
    key: 'new-task',
    description: 'Create a new task',
    keys: ['N'],
  },
  {
    key: 'search',
    description: 'Focus search bar',
    keys: ['/'],
  },
  {
    key: 'goals',
    description: 'Navigate to Goals',
    keys: ['G'],
  },
  {
    key: 'dashboard',
    description: 'Navigate to Dashboard',
    keys: ['D'],
  },
  {
    key: 'close-modal',
    description: 'Close modal or dialog',
    keys: ['Esc'],
  },
  {
    key: 'undo',
    description: 'Undo last action',
    keys: ['Ctrl', 'Z'],
  },
];

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Master these shortcuts to become a power user
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {SHORTCUTS.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
            >
              <p className="text-sm font-medium flex-1">{shortcut.description}</p>
              <div className="flex gap-1">
                {shortcut.keys.map((k, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <Kbd>{k}</Kbd>
                    {idx < shortcut.keys.length - 1 && (
                      <span className="text-xs text-muted-foreground">+</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
          💡 Shortcuts only work when you're not typing in a text field. Press <Kbd>?</Kbd> anytime to show this help.
        </div>
      </DialogContent>
    </Dialog>
  );
}

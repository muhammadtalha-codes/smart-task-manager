import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface PomodoroTimerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PomodoroTimer({ open, onOpenChange }: PomodoroTimerProps) {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);

  // Total seconds for current session
  const totalSeconds = (isWorkSession ? workMinutes : breakMinutes) * 60 + seconds;
  const progress = ((totalSeconds - (isWorkSession ? workMinutes : breakMinutes) * 60 - seconds) / totalSeconds) * 100;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isRunning) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if ((isWorkSession ? workMinutes : breakMinutes) === 0) {
            // Switch sessions
            setIsWorkSession(!isWorkSession);
            setSeconds(0);
            // Play sound notification
            playNotification();
          } else {
            setSeconds(59);
            if (isWorkSession) {
              setWorkMinutes(workMinutes - 1);
            } else {
              setBreakMinutes(breakMinutes - 1);
            }
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, seconds, workMinutes, breakMinutes, isWorkSession]);

  const handleReset = () => {
    setIsRunning(false);
    setWorkMinutes(25);
    setBreakMinutes(5);
    setSeconds(0);
    setIsWorkSession(true);
  };

  const playNotification = () => {
    // Simple beep using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const displayTime = `${String(isWorkSession ? workMinutes : breakMinutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pomodoro Timer
          </DialogTitle>
          <DialogDescription>Stay focused with the Pomodoro technique</DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {/* Session indicator */}
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {isWorkSession ? '🎯 Work Session' : '☕ Break Time'}
            </p>
          </div>

          {/* Timer display */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-48 h-48 flex items-center justify-center rounded-full border-4 border-primary/20 bg-primary/5">
              {/* Progress circle */}
              <svg className="absolute w-full h-full -rotate-90" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.05))' }}>
                <circle
                  cx="96"
                  cy="96"
                  r="92"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="4"
                  strokeDasharray={`${(progress / 100) * 577.5} 577.5`}
                  strokeLinecap="round"
                />
              </svg>

              {/* Time display */}
              <div className="text-center relative z-10">
                <div className="text-5xl font-bold text-primary font-mono">{displayTime}</div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3">
            <Button
              size="lg"
              onClick={() => setIsRunning(!isRunning)}
              className="gap-2"
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start
                </>
              )}
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={handleReset}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>

          <Separator />

          {/* Settings */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Work Duration (minutes)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={workMinutes}
                onChange={(e) => {
                  setWorkMinutes(Math.max(1, parseInt(e.target.value) || 25));
                  if (!isRunning) setSeconds(0);
                }}
                disabled={isRunning}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground disabled:opacity-50"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Break Duration (minutes)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={breakMinutes}
                onChange={(e) => {
                  setBreakMinutes(Math.max(1, parseInt(e.target.value) || 5));
                  if (!isRunning) setSeconds(0);
                }}
                disabled={isRunning}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground disabled:opacity-50"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2 text-center">
            💡 Tip: Use Pomodoro to maintain focus and avoid burnout. The timer will notify you when each session ends.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Bell, Moon, Plus, Search, Sun, Undo2, Zap, Settings, Clock, History, Circle as HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "@/components/theme-provider";
import { useApp, useDispatch, requestNotificationPermission } from "@/store";
import { Kbd } from "@/components/ui/kbd";
import { UserProfile } from "./UserProfile";
import { SettingsPanel } from "./SettingsPanel";
import { PomodoroTimer } from "./PomodoroTimer";

interface NavbarProps {
  onAddTask: () => void;
  onActivityClick?: () => void;
  onHelpClick?: () => void;
}

export function Navbar({ onAddTask, onActivityClick, onHelpClick }: NavbarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pomodoroOpen, setPomodoroOpen] = useState(false);
  const { setTheme, theme } = useTheme();
  const { state, stats } = useApp();
  const dispatch = useDispatch();

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-3 px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="hidden font-semibold text-base sm:inline-block">TaskFlow</span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-9 h-8 text-sm bg-muted/50 border-0 focus-visible:bg-background focus-visible:ring-1"
              value={state.searchQuery}
              onChange={(e) => dispatch({ type: "SET_SEARCH", payload: e.target.value })}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {/* Undo */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => dispatch({ type: "UNDO" })}
                  disabled={state.undoStack.length === 0}
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Undo <Kbd>⌘Z</Kbd>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Notifications */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="relative"
                  onClick={() => requestNotificationPermission()}
                >
                  <Bell className="h-4 w-4" />
                  {stats.overdue > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                      {stats.overdue}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Overdue tasks</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Activity history */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onActivityClick}
                >
                  <History className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Activity history</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Keyboard shortcuts help */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onHelpClick}
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Keyboard shortcuts <Kbd className="ml-1">?</Kbd></TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Pomodoro timer */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setPomodoroOpen(true)}
                >
                  <Clock className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Pomodoro timer</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Theme toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle theme</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Settings */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setSettingsOpen(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Add task */}
          <Button size="sm" onClick={onAddTask} className="gap-1.5 hidden sm:flex">
            <Plus className="h-4 w-4" />
            New Task
            <Kbd className="ml-1 text-primary-foreground/70 bg-primary-foreground/20 border-primary-foreground/20">⌘N</Kbd>
          </Button>
          <Button size="icon-sm" onClick={onAddTask} className="sm:hidden">
            <Plus className="h-4 w-4" />
          </Button>

          {/* User profile */}
          <UserProfile />
        </div>
      </div>

      {/* Settings Panel */}
      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Pomodoro Timer */}
      <PomodoroTimer open={pomodoroOpen} onOpenChange={setPomodoroOpen} />
    </header>
  );
}

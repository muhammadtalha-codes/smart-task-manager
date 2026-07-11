import { useState, useCallback, useEffect } from "react";
import { LayoutDashboard, ListTodo } from "lucide-react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AppProvider, useDispatch, useKeyboardShortcuts } from "@/store";
import { AuthProvider, useAuth } from "@/lib/auth";
import { useKeyboardShortcuts as useCustomShortcuts } from "@/hooks/useKeyboardShortcuts";
import { AppSidebar } from "@/components/AppSidebar";
import { Navbar } from "@/components/Navbar";
import { TaskForm } from "@/components/TaskForm";
import { TaskListView } from "@/components/TaskListView";
import { Dashboard } from "@/components/Dashboard";
import { AuthPage } from "@/components/AuthPage";
import { ActivityHistory } from "@/components/ActivityHistory";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { Spinner } from "@/components/ui/spinner";
import type { Task } from "@/types";

type View = "tasks" | "dashboard";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AppInner() {
  const [view, setView] = useState<View>("tasks");
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [activityOpen, setActivityOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const dispatch = useDispatch();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/auth';
    }
  }, [user, loading]);

  const openAddTask = useCallback(() => {
    setEditTask(null);
    setTaskFormOpen(true);
  }, []);

  const openEditTask = useCallback((task: Task) => {
    setEditTask(task);
    setTaskFormOpen(true);
  }, []);

  useKeyboardShortcuts({
    onAddTask: openAddTask,
    onUndo: () => dispatch({ type: "UNDO" }),
  });

  useCustomShortcuts({
    onNewTask: openAddTask,
    onSearch: () => {
      const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
      searchInput?.focus();
    },
    onGoals: () => {},
    onDashboard: () => setView("dashboard"),
    onUndo: () => dispatch({ type: "UNDO" }),
    onShowHelp: () => setHelpOpen(true),
  });

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="overflow-hidden">
        <Navbar
          onAddTask={openAddTask}
          onActivityClick={() => setActivityOpen(true)}
          onHelpClick={() => setHelpOpen(true)}
        />

        {/* View switcher */}
        <div className="flex items-center gap-1 px-4 py-2 border-b bg-background">
          <SidebarTrigger className="mr-1" />
          <Separator orientation="vertical" className="h-4 mr-1" />
          <Button
            variant={view === "tasks" ? "secondary" : "ghost"}
            size="xs"
            onClick={() => setView("tasks")}
            className="gap-1.5"
          >
            <ListTodo className="h-3.5 w-3.5" />
            Tasks
          </Button>
          <Button
            variant={view === "dashboard" ? "secondary" : "ghost"}
            size="xs"
            onClick={() => setView("dashboard")}
            className="gap-1.5"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard
          </Button>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {view === "tasks" ? (
            <TaskListView onEditTask={openEditTask} />
          ) : (
            <Dashboard />
          )}
        </main>
      </SidebarInset>

      {/* Task form */}
      <TaskForm
        open={taskFormOpen}
        onClose={() => {
          setTaskFormOpen(false);
          setEditTask(null);
        }}
        editTask={editTask}
      />

      {/* Activity history */}
      <ActivityHistory open={activityOpen} onOpenChange={setActivityOpen} />

      {/* Keyboard shortcuts help */}
      <KeyboardShortcutsHelp open={helpOpen} onOpenChange={setHelpOpen} />

      {/* Offline indicator */}
      <OfflineIndicator />

      <Toaster />
    </SidebarProvider>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppInner />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;

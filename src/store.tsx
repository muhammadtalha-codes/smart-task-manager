import React, { createContext, useContext, useReducer, useEffect } from "react";
import type { AppState, AppAction, Task, TaskList } from "./types";
import { DEFAULT_LISTS, STORAGE_KEY } from "./constants";

const defaultState: AppState = {
  tasks: [],
  lists: DEFAULT_LISTS,
  activeListId: "default",
  searchQuery: "",
  filterCategory: "all",
  filterPriority: "all",
  filterStatus: "all",
  sortBy: "created",
  undoStack: [],
};

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return { ...defaultState, ...parsed, undoStack: [] };
  } catch {
    return defaultState;
  }
}

function saveState(state: AppState) {
  try {
    const { undoStack: _u, ...toSave } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch { /* ignore */ }
}

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "ADD_TASK": {
      const newTasks = [...state.tasks, action.payload];
      return { ...state, tasks: newTasks, undoStack: [...state.undoStack, state.tasks] };
    }
    case "UPDATE_TASK": {
      const tasks = state.tasks.map((t) => (t.id === action.payload.id ? action.payload : t));
      return { ...state, tasks, undoStack: [...state.undoStack, state.tasks] };
    }
    case "DELETE_TASK": {
      const tasks = state.tasks.filter((t) => t.id !== action.payload);
      return { ...state, tasks, undoStack: [...state.undoStack, state.tasks] };
    }
    case "TOGGLE_TASK": {
      const tasks = state.tasks.map((t) =>
        t.id === action.payload
          ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() }
          : t
      );
      return { ...state, tasks, undoStack: [...state.undoStack, state.tasks] };
    }
    case "REORDER_TASKS":
      return { ...state, tasks: action.payload };
    case "ADD_LIST":
      return { ...state, lists: [...state.lists, action.payload], activeListId: action.payload.id };
    case "DELETE_LIST": {
      const lists = state.lists.filter((l) => l.id !== action.payload);
      const tasks = state.tasks.filter((t) => t.listId !== action.payload);
      const activeListId = state.activeListId === action.payload ? (lists[0]?.id ?? "default") : state.activeListId;
      return { ...state, lists, tasks, activeListId };
    }
    case "SET_ACTIVE_LIST":
      return { ...state, activeListId: action.payload };
    case "SET_SEARCH":
      return { ...state, searchQuery: action.payload };
    case "SET_FILTER_CATEGORY":
      return { ...state, filterCategory: action.payload };
    case "SET_FILTER_PRIORITY":
      return { ...state, filterPriority: action.payload };
    case "SET_FILTER_STATUS":
      return { ...state, filterStatus: action.payload };
    case "SET_SORT":
      return { ...state, sortBy: action.payload };
    case "UNDO": {
      if (state.undoStack.length === 0) return state;
      const stack = [...state.undoStack];
      const prev = stack.pop()!;
      return { ...state, tasks: prev, undoStack: stack };
    }
    case "RESTORE_STATE":
      return action.payload;
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  filteredAndSortedTasks: Task[];
  activeList: TaskList | undefined;
  stats: { total: number; completed: number; pending: number; overdue: number; pct: number };
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Browser notifications for due tasks
  useEffect(() => {
    if (!("Notification" in window)) return;
    const checkDue = () => {
      const now = new Date();
      state.tasks.forEach((t) => {
        if (t.completed || !t.dueDate) return;
        const due = new Date(t.dueDate);
        const diff = due.getTime() - now.getTime();
        if (diff > 0 && diff < 30 * 60 * 1000) {
          if (Notification.permission === "granted") {
            new Notification("Task Due Soon", { body: t.title, icon: "/vite.svg" });
          }
        }
      });
    };
    const interval = setInterval(checkDue, 60000);
    return () => clearInterval(interval);
  }, [state.tasks]);

  const filteredAndSortedTasks = React.useMemo(() => {
    let tasks = state.tasks.filter((t) => t.listId === state.activeListId);

    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    if (state.filterCategory !== "all") tasks = tasks.filter((t) => t.category === state.filterCategory);
    if (state.filterPriority !== "all") tasks = tasks.filter((t) => t.priority === state.filterPriority);
    if (state.filterStatus === "completed") tasks = tasks.filter((t) => t.completed);
    if (state.filterStatus === "pending") tasks = tasks.filter((t) => !t.completed);

    tasks = [...tasks].sort((a, b) => {
      switch (state.sortBy) {
        case "priority":
          return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
        case "alphabetical":
          return a.title.localeCompare(b.title);
        case "date":
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "created":
        default:
          return a.order - b.order;
      }
    });

    return tasks;
  }, [state]);

  const stats = React.useMemo(() => {
    const allTasks = state.tasks.filter((t) => t.listId === state.activeListId);
    const completed = allTasks.filter((t) => t.completed).length;
    const total = allTasks.length;
    const now = new Date();
    const overdue = allTasks.filter(
      (t) => !t.completed && t.dueDate && new Date(t.dueDate) < now
    ).length;
    return {
      total,
      completed,
      pending: total - completed,
      overdue,
      pct: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  }, [state.tasks, state.activeListId]);

  const activeList = state.lists.find((l) => l.id === state.activeListId);

  const value = React.useMemo(
    () => ({ state, dispatch, filteredAndSortedTasks, activeList, stats }),
    [state, dispatch, filteredAndSortedTasks, activeList, stats]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function useDispatch() {
  return useApp().dispatch;
}

export function createTask(partial: Partial<Task> & { title: string; listId: string }): Task {
  return {
    id: crypto.randomUUID(),
    title: partial.title,
    description: partial.description ?? "",
    completed: false,
    priority: partial.priority ?? "medium",
    category: partial.category ?? "personal",
    dueDate: partial.dueDate ?? null,
    tags: partial.tags ?? [],
    subtasks: partial.subtasks ?? [],
    listId: partial.listId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    recurring: partial.recurring ?? "none",
    order: Date.now(),
  };
}

export function useKeyboardShortcuts(callbacks: {
  onAddTask: () => void;
  onUndo: () => void;
}) {
  const { onAddTask, onUndo } = callbacks;
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") return;
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        onAddTask();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        onUndo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onAddTask, onUndo]);
}

// Notify permission request
export async function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    await Notification.requestPermission();
  }
}

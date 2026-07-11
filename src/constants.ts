import type { Category, Priority, TaskList } from "./types";

export const PRIORITY_COLORS: Record<Priority, string> = {
  high: "text-destructive",
  medium: "text-chart-4",
  low: "text-chart-2",
};

export const PRIORITY_BG: Record<Priority, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  low: "bg-chart-2/10 text-chart-2 border-chart-2/20",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  work: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  study: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  personal: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  other: "bg-muted text-muted-foreground",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  work: "Work",
  study: "Study",
  personal: "Personal",
  other: "Other",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const DEFAULT_LISTS: TaskList[] = [
  { id: "default", name: "Daily Tasks", emoji: "☀️", color: "#4F46E5", createdAt: new Date().toISOString() },
  { id: "projects", name: "Projects", emoji: "🚀", color: "#059669", createdAt: new Date().toISOString() },
  { id: "goals", name: "Goals", emoji: "🎯", color: "#D97706", createdAt: new Date().toISOString() },
];

export const STORAGE_KEY = "taskflow_state";

export type Priority = "high" | "medium" | "low";
export type Category = "work" | "study" | "personal" | "other";
export type RecurringType = "none" | "daily" | "weekly";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  dueDate: string | null; // ISO date string
  tags: string[];
  subtasks: Subtask[];
  listId: string;
  createdAt: string;
  updatedAt: string;
  recurring: RecurringType;
  order: number;
}

export interface TaskList {
  id: string;
  name: string;
  emoji: string;
  color: string;
  createdAt: string;
}

export interface AppState {
  tasks: Task[];
  lists: TaskList[];
  activeListId: string;
  searchQuery: string;
  filterCategory: Category | "all";
  filterPriority: Priority | "all";
  filterStatus: "all" | "completed" | "pending";
  sortBy: "date" | "priority" | "alphabetical" | "created";
  undoStack: Task[][];
}

export type AppAction =
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "TOGGLE_TASK"; payload: string }
  | { type: "REORDER_TASKS"; payload: Task[] }
  | { type: "ADD_LIST"; payload: TaskList }
  | { type: "DELETE_LIST"; payload: string }
  | { type: "SET_ACTIVE_LIST"; payload: string }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_FILTER_CATEGORY"; payload: Category | "all" }
  | { type: "SET_FILTER_PRIORITY"; payload: Priority | "all" }
  | { type: "SET_FILTER_STATUS"; payload: "all" | "completed" | "pending" }
  | { type: "SET_SORT"; payload: "date" | "priority" | "alphabetical" | "created" }
  | { type: "UNDO" }
  | { type: "RESTORE_STATE"; payload: AppState };

import { useRef } from "react";
import {
  ArrowDownAZ, ArrowUpDown, CalendarDays, CheckCircle2, Circle, Filter,
  ListFilter, SlidersHorizontal, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuLabel,
  DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { TaskItem } from "./TaskItem";
import type { Task, Category, Priority } from "@/types";
import { CATEGORY_LABELS, PRIORITY_LABELS } from "@/constants";
import { useApp, useDispatch } from "@/store";
import { cn } from "@/lib/utils";

interface TaskListViewProps {
  onEditTask: (task: Task) => void;
}

export function TaskListView({ onEditTask }: TaskListViewProps) {
  const { state, filteredAndSortedTasks, activeList, stats } = useApp();
  const dispatch = useDispatch();
  const dragTaskRef = useRef<Task | null>(null);

  const hasFilters =
    state.filterCategory !== "all" ||
    state.filterPriority !== "all" ||
    state.filterStatus !== "all" ||
    state.searchQuery !== "";

  const clearFilters = () => {
    dispatch({ type: "SET_FILTER_CATEGORY", payload: "all" });
    dispatch({ type: "SET_FILTER_PRIORITY", payload: "all" });
    dispatch({ type: "SET_FILTER_STATUS", payload: "all" });
    dispatch({ type: "SET_SEARCH", payload: "" });
  };

  function handleDragStart(_e: React.DragEvent, task: Task) {
    dragTaskRef.current = task;
  }

  function handleDrop(_e: React.DragEvent, targetTask: Task) {
    if (!dragTaskRef.current || dragTaskRef.current.id === targetTask.id) return;
    const allTasks = [...state.tasks];
    const dragIdx = allTasks.findIndex((t) => t.id === dragTaskRef.current!.id);
    const targetIdx = allTasks.findIndex((t) => t.id === targetTask.id);
    const [removed] = allTasks.splice(dragIdx, 1);
    allTasks.splice(targetIdx, 0, removed);
    const reordered = allTasks.map((t, i) => ({ ...t, order: i }));
    dispatch({ type: "REORDER_TASKS", payload: reordered });
    dragTaskRef.current = null;
  }

  const pendingTasks = filteredAndSortedTasks.filter((t) => !t.completed);
  const completedTasks = filteredAndSortedTasks.filter((t) => t.completed);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">{activeList?.emoji}</span>
            <h1 className="font-semibold text-lg truncate">{activeList?.name}</h1>
            {stats.total > 0 && (
              <Badge variant="secondary" className="text-xs shrink-0">
                {stats.pending} left
              </Badge>
            )}
          </div>
          {stats.total > 0 && (
            <div className="flex items-center gap-2 mt-1.5">
              <Progress value={stats.pct} className="h-1.5 max-w-48" />
              <span className="text-xs text-muted-foreground">{stats.pct}% complete</span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 shrink-0">
          {hasFilters && (
            <Button variant="ghost" size="xs" onClick={clearFilters} className="text-muted-foreground">
              Clear
            </Button>
          )}

          {/* Category filter */}
          <Select
            value={state.filterCategory}
            onValueChange={(v) => dispatch({ type: "SET_FILTER_CATEGORY", payload: v as Category | "all" })}
          >
            <SelectTrigger className="h-8 text-xs w-auto min-w-[80px] gap-1">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Priority filter */}
          <Select
            value={state.filterPriority}
            onValueChange={(v) => dispatch({ type: "SET_FILTER_PRIORITY", payload: v as Priority | "all" })}
          >
            <SelectTrigger className="h-8 text-xs w-auto min-w-[80px] gap-1">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {(["high", "medium", "low"] as Priority[]).map((p) => (
                <SelectItem key={p} value={p}>{PRIORITY_LABELS[p]}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort & more */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon-sm" className={cn(hasFilters && "border-primary text-primary")}>
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={state.sortBy}
                onValueChange={(v) => dispatch({ type: "SET_SORT", payload: v as typeof state.sortBy })}
              >
                <DropdownMenuRadioItem value="created">
                  <ArrowUpDown className="h-3.5 w-3.5 mr-2" />
                  Default
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="priority">
                  <ListFilter className="h-3.5 w-3.5 mr-2" />
                  Priority
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="date">
                  <CalendarDays className="h-3.5 w-3.5 mr-2" />
                  Due Date
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="alphabetical">
                  <ArrowDownAZ className="h-3.5 w-3.5 mr-2" />
                  Alphabetical
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={state.filterStatus}
                onValueChange={(v) => dispatch({ type: "SET_FILTER_STATUS", payload: v as typeof state.filterStatus })}
              >
                <DropdownMenuRadioItem value="all">All tasks</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="pending">
                  <Circle className="h-3.5 w-3.5 mr-2" />
                  Pending
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="completed">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                  Completed
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Empty state */}
      {filteredAndSortedTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {hasFilters ? (
            <>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <Filter className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-base">No matching tasks</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Try adjusting your filters or search query.
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                Clear filters
              </Button>
            </>
          ) : (
            <>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-base">All clear!</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                No tasks in this list yet. Add your first task to get started.
              </p>
            </>
          )}
        </div>
      )}

      {/* Pending tasks */}
      {pendingTasks.length > 0 && (
        <div className="space-y-2">
          {state.filterStatus !== "completed" && (
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
              Pending · {pendingTasks.length}
            </p>
          )}
          {pendingTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={onEditTask}
              draggable
              onDragStart={handleDragStart}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}

      {/* Completed tasks */}
      {completedTasks.length > 0 && (
        <div className="space-y-2">
          {state.filterStatus !== "pending" && (
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1 mt-2">
              Completed · {completedTasks.length}
            </p>
          )}
          {completedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={onEditTask}
              draggable
              onDragStart={handleDragStart}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
}

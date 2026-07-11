import { useState } from "react";
import {
  Calendar, ChevronDown, ChevronRight, Edit2, GripVertical, MoreHorizontal,
  RefreshCw, Trash2, CheckSquare, AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Task } from "@/types";
import { CATEGORY_COLORS, PRIORITY_BG } from "@/constants";
import { useDispatch } from "@/store";
import { cn } from "@/lib/utils";
import { format, isPast, isToday, isTomorrow } from "date-fns";

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
  onDragOver?: (e: React.DragEvent, task: Task) => void;
  onDrop?: (e: React.DragEvent, task: Task) => void;
}

export function TaskItem({ task, onEdit, draggable, onDragStart, onDragOver, onDrop }: TaskItemProps) {
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const subtaskDone = task.subtasks.filter((s) => s.completed).length;
  const subtaskPct = task.subtasks.length > 0 ? Math.round((subtaskDone / task.subtasks.length) * 100) : 0;

  const dueInfo = (() => {
    if (!task.dueDate) return null;
    const d = new Date(task.dueDate);
    const overdue = !task.completed && isPast(d);
    const todayDue = isToday(d);
    const tomorrowDue = isTomorrow(d);
    let label = format(d, "MMM d, h:mm a");
    if (todayDue) label = `Today ${format(d, "h:mm a")}`;
    if (tomorrowDue) label = `Tomorrow ${format(d, "h:mm a")}`;
    return { label, overdue, todayDue };
  })();

  const handleToggle = () => dispatch({ type: "TOGGLE_TASK", payload: task.id });
  const handleDelete = () => dispatch({ type: "DELETE_TASK", payload: task.id });

  const toggleSubtask = (subtaskId: string) => {
    const updated = {
      ...task,
      subtasks: task.subtasks.map((s) =>
        s.id === subtaskId ? { ...s, completed: !s.completed } : s
      ),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: "UPDATE_TASK", payload: updated });
  };

  return (
    <div
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, task)}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
        onDragOver?.(e, task);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        setIsDragOver(false);
        onDrop?.(e, task);
      }}
      className={cn(
        "group relative rounded-xl border bg-card transition-all duration-200",
        "hover:shadow-sm hover:border-border/80",
        task.completed && "opacity-60",
        isDragOver && "border-primary/50 shadow-md",
        dueInfo?.overdue && !task.completed && "border-destructive/30 bg-destructive/[0.02]"
      )}
    >
      <div className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          {/* Drag handle */}
          {draggable && (
            <div className="mt-0.5 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          )}

          {/* Checkbox */}
          <Checkbox
            checked={task.completed}
            onCheckedChange={handleToggle}
            className="mt-0.5 shrink-0"
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 flex-wrap">
              <span
                className={cn(
                  "text-sm font-medium leading-snug break-words",
                  task.completed && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </span>
              {/* Priority badge */}
              <Badge
                variant="outline"
                className={cn("shrink-0 text-[10px] px-1.5 py-0 h-4 font-medium", PRIORITY_BG[task.priority])}
              >
                {task.priority}
              </Badge>
              {/* Category badge */}
              <Badge
                variant="outline"
                className={cn("shrink-0 text-[10px] px-1.5 py-0 h-4", CATEGORY_COLORS[task.category])}
              >
                {task.category}
              </Badge>
              {/* Recurring */}
              {task.recurring !== "none" && (
                <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0 h-4 text-muted-foreground gap-0.5">
                  <RefreshCw className="h-2.5 w-2.5" />
                  {task.recurring}
                </Badge>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {/* Due date */}
              {dueInfo && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-[11px]",
                    dueInfo.overdue ? "text-destructive font-medium" : dueInfo.todayDue ? "text-chart-4" : "text-muted-foreground"
                  )}
                >
                  {dueInfo.overdue ? (
                    <AlertCircle className="h-3 w-3 shrink-0" />
                  ) : (
                    <Calendar className="h-3 w-3 shrink-0" />
                  )}
                  <span>{dueInfo.label}</span>
                  {dueInfo.overdue && <span className="text-destructive/80">(overdue)</span>}
                </div>
              )}

              {/* Tags */}
              {task.tags.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {task.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[10px] text-primary/80 bg-primary/8 px-1.5 py-0.5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                  {task.tags.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">+{task.tags.length - 3}</span>
                  )}
                </div>
              )}

              {/* Subtask count */}
              {task.subtasks.length > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <CheckSquare className="h-3 w-3" />
                  <span>{subtaskDone}/{task.subtasks.length}</span>
                </div>
              )}
            </div>

            {/* Subtask progress bar */}
            {task.subtasks.length > 0 && (
              <div className="mt-2">
                <Progress value={subtaskPct} className="h-1" />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Expand subtasks */}
            {task.subtasks.length > 0 && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setExpanded(!expanded)}
                className="text-muted-foreground hover:text-foreground"
              >
                {expanded ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </Button>
            )}

            {/* Quick edit */}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onEdit(task)}
              className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>

            {/* More menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit2 className="h-3.5 w-3.5 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggle}>
                  <Checkbox className="h-3.5 w-3.5 mr-2 border-0 bg-transparent shadow-none" checked={task.completed} />
                  {task.completed ? "Mark pending" : "Mark done"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Subtasks expanded */}
        {expanded && task.subtasks.length > 0 && (
          <div className="mt-3 ml-7 space-y-2 pt-2 border-t">
            {task.subtasks.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <Checkbox
                  checked={s.completed}
                  onCheckedChange={() => toggleSubtask(s.id)}
                  className="shrink-0"
                />
                <span
                  className={cn(
                    "text-xs",
                    s.completed && "line-through text-muted-foreground"
                  )}
                >
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

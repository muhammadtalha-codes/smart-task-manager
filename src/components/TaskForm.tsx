import { useState, useEffect } from "react";
import { Plus, X, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import type { Task, Priority, Category, RecurringType, Subtask } from "@/types";
import { CATEGORY_LABELS } from "@/constants";
import { useApp, useDispatch, createTask } from "@/store";
import { cn } from "@/lib/utils";

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  editTask?: Task | null;
}

export function TaskForm({ open, onClose, editTask }: TaskFormProps) {
  const { state } = useApp();
  const dispatch = useDispatch();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState<Category>("personal");
  const [dueDate, setDueDate] = useState("");
  const [recurring, setRecurring] = useState<RecurringType>("none");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description);
      setPriority(editTask.priority);
      setCategory(editTask.category);
      setDueDate(editTask.dueDate ? editTask.dueDate.slice(0, 16) : "");
      setRecurring(editTask.recurring);
      setTags(editTask.tags);
      setSubtasks(editTask.subtasks);
    } else {
      resetForm();
    }
  }, [editTask, open]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setCategory("personal");
    setDueDate("");
    setRecurring("none");
    setTagInput("");
    setTags([]);
    setSubtasks([]);
    setSubtaskInput("");
    setErrors({});
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required";
    if (dueDate && new Date(dueDate) < new Date(Date.now() - 60000)) {
      // Allow slightly past dates (1 min buffer) - only warn, don't block
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      recurring,
      tags,
      subtasks,
      listId: state.activeListId,
    };

    if (editTask) {
      dispatch({
        type: "UPDATE_TASK",
        payload: {
          ...editTask,
          ...taskData,
          updatedAt: new Date().toISOString(),
        },
      });
    } else {
      dispatch({ type: "ADD_TASK", payload: createTask(taskData) });
    }

    onClose();
    resetForm();
  }

  function addTag() {
    const t = tagInput.trim().replace(/^#/, "");
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function addSubtask() {
    if (!subtaskInput.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: crypto.randomUUID(), title: subtaskInput.trim(), completed: false },
    ]);
    setSubtaskInput("");
  }

  function toggleSubtask(id: string) {
    setSubtasks(subtasks.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)));
  }

  function removeSubtask(id: string) {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  }

  const priorityConfig: Record<Priority, { label: string; color: string }> = {
    high: { label: "High", color: "text-destructive" },
    medium: { label: "Medium", color: "text-chart-4" },
    low: { label: "Low", color: "text-chart-2" },
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); resetForm(); } }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {editTask ? "Edit Task" : "New Task"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="subtasks">
              Subtasks
              {subtasks.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                  {subtasks.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Basic Tab */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors({}); }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                autoFocus
                aria-invalid={!!errors.title}
                className={cn(errors.title && "border-destructive")}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add notes or details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["high", "medium", "low"] as Priority[]).map((p) => (
                      <SelectItem key={p} value={p}>
                        <span className={cn("font-medium", priorityConfig[p].color)}>
                          {priorityConfig[p].label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label htmlFor="dueDate">Due Date & Time</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Recurring</Label>
              <Select value={recurring} onValueChange={(v) => setRecurring(v as RecurringType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="#urgent, #client..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="flex-1"
                />
                <Button variant="outline" size="sm" onClick={addTag} type="button">
                  <Tag className="h-3.5 w-3.5" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-1 pr-1 text-xs cursor-default"
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-destructive ml-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Subtasks Tab */}
          <TabsContent value="subtasks" className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label>Add Subtask</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Subtask title..."
                  value={subtaskInput}
                  onChange={(e) => setSubtaskInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                  className="flex-1"
                />
                <Button variant="outline" size="sm" onClick={addSubtask} type="button">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {subtasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No subtasks yet. Add some to break down this task.
              </p>
            ) : (
              <div className="space-y-2">
                {subtasks.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                    <Checkbox
                      checked={s.completed}
                      onCheckedChange={() => toggleSubtask(s.id)}
                    />
                    <span className={cn("flex-1 text-sm", s.completed && "line-through text-muted-foreground")}>
                      {s.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeSubtask(s.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <div className="pt-1">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{subtasks.filter((s) => s.completed).length}/{subtasks.length}</span>
                  </div>
                  {/* inline progress bar */}
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{
                        width: `${subtasks.length === 0 ? 0 : (subtasks.filter((s) => s.completed).length / subtasks.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Separator />

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => { onClose(); resetForm(); }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {editTask ? "Save Changes" : "Add Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

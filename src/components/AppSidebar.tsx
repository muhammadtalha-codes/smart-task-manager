import { useState } from "react";
import {
  Plus, Trash2,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuAction, SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useApp, useDispatch } from "@/store";
import type { TaskList } from "@/types";

const LIST_EMOJIS = ["📋", "☀️", "🚀", "🎯", "📚", "💼", "🏠", "❤️", "⭐", "🌟"];
const LIST_COLORS = ["#4F46E5", "#059669", "#D97706", "#DC2626", "#0891B2", "#7C3AED", "#DB2777"];

export function AppSidebar() {
  const { state, stats } = useApp();
  const dispatch = useDispatch();
  const [showNewList, setShowNewList] = useState(false);
  const [listName, setListName] = useState("");
  const [listEmoji, setListEmoji] = useState("📋");
  const [listColor, setListColor] = useState(LIST_COLORS[0]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreateList = () => {
    if (!listName.trim()) return;
    const newList: TaskList = {
      id: crypto.randomUUID(),
      name: listName.trim(),
      emoji: listEmoji,
      color: listColor,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: "ADD_LIST", payload: newList });
    setListName("");
    setListEmoji("📋");
    setListColor(LIST_COLORS[0]);
    setShowNewList(false);
  };

  const getListPendingCount = (listId: string) =>
    state.tasks.filter((t) => t.listId === listId && !t.completed).length;

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b">
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-xs text-muted-foreground">Productivity</span>
              <div className="flex items-center gap-2">
                <Progress value={stats.pct} className="h-1.5 flex-1" />
                <span className="text-xs font-medium text-primary shrink-0">{stats.pct}%</span>
              </div>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* Stats */}
          <SidebarGroup>
            <SidebarGroupLabel>Overview</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="grid grid-cols-2 gap-2 px-2 pb-2">
                <div className="rounded-lg bg-muted/60 p-2 text-center">
                  <p className="text-lg font-bold text-foreground">{stats.total}</p>
                  <p className="text-[10px] text-muted-foreground">Total</p>
                </div>
                <div className="rounded-lg bg-primary/10 p-2 text-center">
                  <p className="text-lg font-bold text-primary">{stats.completed}</p>
                  <p className="text-[10px] text-muted-foreground">Done</p>
                </div>
                <div className="rounded-lg bg-muted/60 p-2 text-center">
                  <p className="text-lg font-bold text-foreground">{stats.pending}</p>
                  <p className="text-[10px] text-muted-foreground">Pending</p>
                </div>
                <div className="rounded-lg bg-destructive/10 p-2 text-center">
                  <p className="text-lg font-bold text-destructive">{stats.overdue}</p>
                  <p className="text-[10px] text-muted-foreground">Overdue</p>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Lists */}
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between pr-1">
              My Lists
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setShowNewList(true)}
                className="h-5 w-5"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {state.lists.map((list) => {
                  const pending = getListPendingCount(list.id);
                  const isActive = state.activeListId === list.id;
                  return (
                    <SidebarMenuItem key={list.id}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => dispatch({ type: "SET_ACTIVE_LIST", payload: list.id })}
                        className="group"
                        tooltip={list.name}
                      >
                        <span className="text-base leading-none">{list.emoji}</span>
                        <span className="flex-1 truncate">{list.name}</span>
                        {pending > 0 && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1.5 shrink-0">
                            {pending}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                      {!["default", "projects", "goals"].includes(list.id) && (
                        <SidebarMenuAction
                          showOnHover
                          onClick={() => setDeleteId(list.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </SidebarMenuAction>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t">
          <div className="px-2 py-1">
            <p className="text-[10px] text-muted-foreground text-center">
              {stats.completed}/{stats.total} tasks completed
            </p>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* New List Dialog */}
      <Dialog open={showNewList} onOpenChange={setShowNewList}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex flex-wrap gap-1.5">
                {LIST_EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setListEmoji(e)}
                    className={`text-xl rounded-md p-1 hover:bg-muted transition-colors ${listEmoji === e ? "bg-muted ring-2 ring-primary" : ""}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <Input
              placeholder="List name..."
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
              autoFocus
            />
            <div className="flex gap-2">
              {LIST_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setListColor(c)}
                  className={`h-6 w-6 rounded-full transition-transform hover:scale-110 ${listColor === c ? "ring-2 ring-offset-2 ring-ring scale-110" : ""}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewList(false)}>Cancel</Button>
            <Button onClick={handleCreateList} disabled={!listName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete List Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete list?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the list and all its tasks. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) dispatch({ type: "DELETE_LIST", payload: deleteId });
                setDeleteId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

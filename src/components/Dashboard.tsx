import { useMemo } from "react";
import {
  AlertCircle, BarChart3, Calendar, CheckCircle2, Circle, TrendingUp, Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart, Bar, XAxis, CartesianGrid, PieChart, Pie, Cell,
} from "recharts";
import { useApp } from "@/store";
import { PRIORITY_BG } from "@/constants";
import { cn } from "@/lib/utils";
import { format, isToday, isTomorrow, isPast, startOfWeek, addDays } from "date-fns";


export function Dashboard() {
  const { state } = useApp();

  const allTasks = state.tasks;

  // Activity by day (past 7 days)
  const weekActivity = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = addDays(startOfWeek(new Date()), i);
      return {
        day: format(d, "EEE"),
        date: d,
        completed: 0,
        added: 0,
      };
    });
    allTasks.forEach((t) => {
      const created = new Date(t.createdAt);
      const idx = days.findIndex(
        (d) => format(d.date, "yyyy-MM-dd") === format(created, "yyyy-MM-dd")
      );
      if (idx >= 0) days[idx].added++;
      if (t.completed) {
        const updated = new Date(t.updatedAt);
        const cidx = days.findIndex(
          (d) => format(d.date, "yyyy-MM-dd") === format(updated, "yyyy-MM-dd")
        );
        if (cidx >= 0) days[cidx].completed++;
      }
    });
    return days;
  }, [allTasks]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    allTasks.forEach((t) => {
      counts[t.category] = (counts[t.category] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [allTasks]);

  const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

  // Upcoming tasks
  const upcomingTasks = useMemo(() => {
    return allTasks
      .filter((t) => !t.completed && t.dueDate)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);
  }, [allTasks]);

  // Overdue tasks
  const overdueTasks = useMemo(() => {
    const now = new Date();
    return allTasks.filter((t) => !t.completed && t.dueDate && new Date(t.dueDate) < now);
  }, [allTasks]);

  // All stats
  const totalCompleted = allTasks.filter((t) => t.completed).length;
  const totalPending = allTasks.filter((t) => !t.completed).length;
  const totalAll = allTasks.length;
  const globalPct = totalAll === 0 ? 0 : Math.round((totalCompleted / totalAll) * 100);

  const statCards = [
    {
      label: "Total Tasks",
      value: totalAll,
      icon: <BarChart3 className="h-4 w-4" />,
      sub: "across all lists",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Completed",
      value: totalCompleted,
      icon: <CheckCircle2 className="h-4 w-4" />,
      sub: `${globalPct}% of all tasks`,
      color: "text-chart-2",
      bg: "bg-chart-2/10",
    },
    {
      label: "Pending",
      value: totalPending,
      icon: <Circle className="h-4 w-4" />,
      sub: "waiting to be done",
      color: "text-chart-4",
      bg: "bg-chart-4/10",
    },
    {
      label: "Overdue",
      value: overdueTasks.length,
      icon: <AlertCircle className="h-4 w-4" />,
      sub: overdueTasks.length > 0 ? "needs attention!" : "all on time!",
      color: overdueTasks.length > 0 ? "text-destructive" : "text-chart-2",
      bg: overdueTasks.length > 0 ? "bg-destructive/10" : "bg-chart-2/10",
    },
  ];

  const chartConfig = {
    added: { label: "Added", color: "var(--chart-1)" },
    completed: { label: "Completed", color: "var(--chart-2)" },
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your productivity overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <Card key={s.label} className="gap-2">
            <CardHeader className="pb-0 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs">{s.label}</CardDescription>
                <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", s.bg, s.color)}>
                  {s.icon}
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className={cn("text-2xl font-bold", s.color)}>{s.value}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Overall Progress</span>
            </div>
            <span className="text-sm font-bold text-primary">{globalPct}%</span>
          </div>
          <Progress value={globalPct} className="h-2.5" />
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-muted-foreground">{totalCompleted} completed</span>
            <span className="text-[10px] text-muted-foreground">{totalPending} remaining</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly activity chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[160px] w-full">
              <BarChart data={weekActivity} barSize={12}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="added" fill="var(--color-added)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="completed" fill="var(--color-completed)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Category breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">By Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <div className="flex items-center justify-center h-[160px] text-sm text-muted-foreground">
                No tasks yet
              </div>
            ) : (
              <ChartContainer config={{}} className="min-h-[160px] w-full">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            )}
            {categoryData.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {categoryData.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-1.5 text-xs">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="capitalize text-muted-foreground">{c.name}</span>
                    <span className="font-medium">{c.value}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming & Overdue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming tasks */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {upcomingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center">
                No upcoming deadlines.
              </p>
            ) : (
              <ScrollArea className="max-h-48">
                <div className="divide-y">
                  {upcomingTasks.map((t) => {
                    const d = new Date(t.dueDate!);
                    const overdue = isPast(d);
                    return (
                      <div key={t.id} className="flex items-start gap-2 p-3">
                        <div className={cn(
                          "shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                          overdue ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                        )}>
                          {overdue ? "!" : "→"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{t.title}</p>
                          <p className={cn("text-[10px] mt-0.5", overdue ? "text-destructive" : "text-muted-foreground")}>
                            {isToday(d) ? `Today ${format(d, "h:mm a")}` : isTomorrow(d) ? `Tomorrow ${format(d, "h:mm a")}` : format(d, "MMM d, h:mm a")}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn("text-[9px] px-1.5 py-0 h-4 shrink-0", PRIORITY_BG[t.priority])}
                        >
                          {t.priority}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Per-list breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Lists Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {state.lists.map((list) => {
                const listTasks = allTasks.filter((t) => t.listId === list.id);
                const done = listTasks.filter((t) => t.completed).length;
                const pct = listTasks.length === 0 ? 0 : Math.round((done / listTasks.length) * 100);
                return (
                  <div key={list.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span>{list.emoji}</span>
                        <span className="font-medium truncate">{list.name}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {done}/{listTasks.length}
                      </span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                );
              })}
              {state.lists.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No lists yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

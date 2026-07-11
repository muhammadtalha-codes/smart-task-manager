import { supabase } from './supabase';

export interface ExportData {
  version: string;
  exportDate: string;
  userId: string;
  tasks: any[];
  goals: any[];
}

export async function exportUserData(userId: string): Promise<ExportData> {
  // Fetch all user tasks
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (tasksError) throw new Error(`Failed to export tasks: ${tasksError.message}`);

  // Fetch all user goals
  const { data: goals, error: goalsError } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (goalsError) throw new Error(`Failed to export goals: ${goalsError.message}`);

  return {
    version: '1.0',
    exportDate: new Date().toISOString(),
    userId,
    tasks: tasks || [],
    goals: goals || [],
  };
}

export function downloadAsJSON(data: ExportData, filename: string = 'taskflow-backup.json') {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadAsCSV(tasks: any[], filename: string = 'tasks-export.csv') {
  if (tasks.length === 0) {
    alert('No tasks to export');
    return;
  }

  const headers = ['Title', 'Description', 'Priority', 'Category', 'Due Date', 'Completed', 'Created'];
  const rows = tasks.map((task) => [
    task.title,
    task.description || '',
    task.priority || 'medium',
    task.category || 'personal',
    task.due_date ? new Date(task.due_date).toLocaleDateString() : '',
    task.completed ? 'Yes' : 'No',
    new Date(task.created_at).toLocaleDateString(),
  ]);

  let csvContent = headers.join(',') + '\n';
  rows.forEach((row) => {
    csvContent += row.map((cell) => `"${cell}"`).join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

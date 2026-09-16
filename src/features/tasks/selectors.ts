import { todayISO } from '@/lib/date';
import type { Task } from '@/types';

export interface TaskBuckets {
  today: Task[];
  upcoming: Task[];
  completed: Task[];
  overdue: Task[];
}

/**
 * "Today" deliberately includes overdue and undated tasks: anything the user
 * could reasonably act on now belongs on the same screen.
 */
export function bucketTasks(tasks: Task[], today = todayISO()): TaskBuckets {
  const open = tasks.filter((task) => !task.completed);

  return {
    today: open.filter((task) => !task.dueDate || task.dueDate <= today),
    upcoming: open.filter((task) => task.dueDate !== undefined && task.dueDate > today),
    completed: tasks.filter((task) => task.completed),
    overdue: open.filter((task) => task.dueDate !== undefined && task.dueDate < today),
  };
}

export interface TaskProgress {
  done: number;
  total: number;
}

/** Progress across everything due today or earlier, completed included. */
export function todayProgress(tasks: Task[], today = todayISO()): TaskProgress {
  const relevant = tasks.filter((task) => {
    if (task.dueDate === undefined) return !task.completed || isCompletedToday(task, today);
    return task.dueDate <= today;
  });

  return {
    done: relevant.filter((task) => task.completed).length,
    total: relevant.length,
  };
}

function isCompletedToday(task: Task, today: string): boolean {
  return Boolean(task.completedAt && task.completedAt.slice(0, 10) === today);
}

export function isOverdue(task: Task, today = todayISO()): boolean {
  return !task.completed && task.dueDate !== undefined && task.dueDate < today;
}

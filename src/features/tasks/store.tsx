import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';

import { createId } from '@/lib/id';
import { StorageKeys } from '@/lib/storage';
import { usePersistedState } from '@/store/use-persisted-state';
import type { Priority, Task } from '@/types';

/** Module scope so the persisted-state load effect has a stable dependency. */
const NO_TASKS: Task[] = [];

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

/**
 * Open tasks first, then by due date, then by priority — the order someone
 * scanning their day actually wants.
 */
function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;

    if (a.completed && b.completed) {
      return (b.completedAt ?? b.updatedAt) < (a.completedAt ?? a.updatedAt) ? -1 : 1;
    }

    // Undated tasks sink below dated ones rather than floating to the top.
    const aDue = a.dueDate ?? '9999-12-31';
    const bDue = b.dueDate ?? '9999-12-31';
    if (aDue !== bDue) return aDue < bDue ? -1 : 1;

    if (a.priority !== b.priority) return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    return a.createdAt < b.createdAt ? -1 : 1;
  });
}

function hydrateTasks(raw: unknown): Task[] {
  if (!Array.isArray(raw)) return [];

  const valid = raw
    .filter((item): item is Partial<Task> => typeof item === 'object' && item !== null)
    .filter((item) => typeof item.id === 'string' && typeof item.title === 'string')
    .map(
      (item): Task => ({
        id: item.id!,
        title: item.title!,
        description: item.description,
        dueDate: item.dueDate,
        priority: item.priority ?? 'medium',
        reminderAt: item.reminderAt,
        notificationId: item.notificationId,
        completed: Boolean(item.completed),
        completedAt: item.completedAt,
        createdAt: item.createdAt ?? new Date().toISOString(),
        updatedAt: item.updatedAt ?? item.createdAt ?? new Date().toISOString(),
      })
    );

  return sortTasks(valid);
}

export type TaskDraft = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'completedAt'>;
export type TaskChanges = Partial<Omit<Task, 'id' | 'createdAt'>>;

interface TasksValue {
  tasks: Task[];
  ready: boolean;
  getTask: (id: string) => Task | undefined;
  addTask: (draft: TaskDraft) => Task;
  updateTask: (id: string, changes: TaskChanges) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  clearCompleted: () => Task[];
}

const TasksContext = createContext<TasksValue | null>(null);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks, ready] = usePersistedState<Task[]>({
    key: StorageKeys.tasks,
    initial: NO_TASKS,
    hydrate: hydrateTasks,
  });

  const getTask = useCallback((id: string) => tasks.find((task) => task.id === id), [tasks]);

  const addTask = useCallback(
    (draft: TaskDraft) => {
      const now = new Date().toISOString();
      const task: Task = { ...draft, id: createId('task'), completed: false, createdAt: now, updatedAt: now };
      setTasks((current) => sortTasks([task, ...current]));
      return task;
    },
    [setTasks]
  );

  const updateTask = useCallback(
    (id: string, changes: TaskChanges) => {
      setTasks((current) =>
        sortTasks(
          current.map((task) =>
            task.id === id ? { ...task, ...changes, updatedAt: new Date().toISOString() } : task
          )
        )
      );
    },
    [setTasks]
  );

  const deleteTask = useCallback(
    (id: string) => setTasks((current) => current.filter((task) => task.id !== id)),
    [setTasks]
  );

  const toggleTask = useCallback(
    (id: string) => {
      setTasks((current) =>
        sortTasks(
          current.map((task) => {
            if (task.id !== id) return task;
            const completed = !task.completed;
            const now = new Date().toISOString();
            return {
              ...task,
              completed,
              completedAt: completed ? now : undefined,
              updatedAt: now,
            };
          })
        )
      );
    },
    [setTasks]
  );

  /** Returns what it removed so the caller can cancel their notifications. */
  const clearCompleted = useCallback(() => {
    const removed = tasks.filter((task) => task.completed);
    setTasks((current) => current.filter((task) => !task.completed));
    return removed;
  }, [tasks, setTasks]);

  const value = useMemo(
    () => ({ tasks, ready, getTask, addTask, updateTask, deleteTask, toggleTask, clearCompleted }),
    [tasks, ready, getTask, addTask, updateTask, deleteTask, toggleTask, clearCompleted]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks(): TasksValue {
  const value = useContext(TasksContext);
  if (!value) throw new Error('useTasks must be used inside <TasksProvider>');
  return value;
}

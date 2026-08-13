export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
};

const todos: Todo[] = [];

export function getTodos(): Todo[] {
  return [...todos].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function createTodo(text: string): Todo {
  const todo: Todo = {
    id: crypto.randomUUID(),
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };
  todos.unshift(todo);
  return todo;
}

export function updateTodo(
  id: string,
  updates: Partial<Pick<Todo, "text" | "completed">>
): Todo | null {
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const current = todos[index];
  const next: Todo = {
    ...current,
    ...updates,
    text: updates.text !== undefined ? updates.text.trim() : current.text,
  };
  todos[index] = next;
  return next;
}

export function deleteTodo(id: string): boolean {
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) return false;
  todos.splice(index, 1);
  return true;
}

export function clearCompleted(): number {
  const before = todos.length;
  for (let i = todos.length - 1; i >= 0; i--) {
    if (todos[i].completed) todos.splice(i, 1);
  }
  return before - todos.length;
}

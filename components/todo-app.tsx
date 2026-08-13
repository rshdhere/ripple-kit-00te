"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { Todo } from "@/lib/todos";

type Filter = "all" | "active" | "completed";

async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch("/api/todos");
  if (!res.ok) throw new Error("Failed to load todos");
  const data = await res.json();
  return data.todos;
}

export function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadTodos = useCallback(async () => {
    try {
      setError(null);
      const next = await fetchTodos();
      setTodos(next);
    } catch {
      setError("Could not load todos. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTodos();
  }, [loadTodos]);

  const filteredTodos = useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.completed);
    if (filter === "completed") return todos.filter((t) => t.completed);
    return todos;
  }, [filter, todos]);

  const activeCount = useMemo(
    () => todos.filter((t) => !t.completed).length,
    [todos]
  );
  const completedCount = todos.length - activeCount;

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to add todo");
      }
      const data = await res.json();
      setTodos((prev) => [data.todo, ...prev]);
      setDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add todo");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleTodo(id: string, completed: boolean) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed } : t))
    );
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
      if (!res.ok) throw new Error("Failed to update todo");
      const data = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === id ? data.todo : t)));
    } catch {
      setError("Failed to update todo");
      void loadTodos();
    }
  }

  async function removeTodo(id: string) {
    const previous = todos;
    setTodos((prev) => prev.filter((t) => t.id !== id));
    try {
      const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete todo");
    } catch {
      setTodos(previous);
      setError("Failed to delete todo");
    }
  }

  async function handleClearCompleted() {
    if (completedCount === 0) return;
    try {
      const res = await fetch("/api/todos/clear-completed", { method: "POST" });
      if (!res.ok) throw new Error("Failed to clear completed");
      const data = await res.json();
      setTodos(data.todos);
    } catch {
      setError("Failed to clear completed todos");
    }
  }

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "completed", label: "Done" },
  ];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-4 py-10 sm:px-6">
      <header className="mb-8 text-center">
        <p className="mb-2 text-sm font-medium tracking-wide text-primary uppercase">
          Ripple Kit
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Todo App
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Capture tasks, mark them done, and keep your day on track.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="What needs to be done?"
            aria-label="New todo"
            disabled={submitting}
            className="h-11 flex-1 text-base"
          />
          <Button
            type="submit"
            disabled={!draft.trim() || submitting}
            className="h-11 px-5"
          >
            Add task
          </Button>
        </form>

        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          {filters.map(({ key, label }) => (
            <Button
              key={key}
              type="button"
              size="sm"
              variant={filter === key ? "default" : "outline"}
              onClick={() => setFilter(key)}
              aria-pressed={filter === key}
            >
              {label}
            </Button>
          ))}
        </div>

        <ul className="mt-6 space-y-2" aria-live="polite">
          {loading ? (
            <li className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              Loading todos…
            </li>
          ) : filteredTodos.length === 0 ? (
            <li className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              {filter === "all"
                ? "No tasks yet. Add one above to get started."
                : filter === "active"
                  ? "No active tasks. Nice work!"
                  : "No completed tasks yet."}
            </li>
          ) : (
            filteredTodos.map((todo) => (
              <li
                key={todo.id}
                className="group flex items-center gap-3 rounded-xl border border-border bg-background/60 px-3 py-3 transition-colors hover:bg-accent/40"
              >
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={(checked) => toggleTodo(todo.id, checked)}
                  aria-label={`Mark "${todo.text}" as ${todo.completed ? "incomplete" : "complete"}`}
                />
                <span
                  className={`min-w-0 flex-1 text-sm leading-relaxed sm:text-base ${
                    todo.completed
                      ? "text-muted-foreground line-through"
                      : "text-foreground"
                  }`}
                >
                  {todo.text}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="opacity-60 transition-opacity group-hover:opacity-100"
                  onClick={() => removeTodo(todo.id)}
                  aria-label={`Delete "${todo.text}"`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4"
                    aria-hidden="true"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </Button>
              </li>
            ))
          )}
        </ul>

        <footer className="mt-6 flex flex-col gap-3 border-t border-border pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            {activeCount} {activeCount === 1 ? "task" : "tasks"} remaining
          </span>
          {completedCount > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearCompleted}
            >
              Clear completed ({completedCount})
            </Button>
          ) : null}
        </footer>
      </section>
    </div>
  );
}

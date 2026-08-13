import { NextResponse } from "next/server";
import { deleteTodo, updateTodo } from "@/lib/todos";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  let body: { text?: string; completed?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.text !== undefined && !body.text.trim()) {
    return NextResponse.json({ error: "Text cannot be empty" }, { status: 400 });
  }

  const todo = updateTodo(id, body);
  if (!todo) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  return NextResponse.json({ todo });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const removed = deleteTodo(id);

  if (!removed) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { createTodo, getTodos } from "@/lib/todos";

export function GET() {
  return NextResponse.json({ todos: getTodos() });
}

export async function POST(request: Request) {
  let body: { text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = body.text?.trim();
  if (!text) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  const todo = createTodo(text);
  return NextResponse.json({ todo }, { status: 201 });
}

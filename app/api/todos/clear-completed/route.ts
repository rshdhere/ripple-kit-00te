import { NextResponse } from "next/server";
import { clearCompleted, getTodos } from "@/lib/todos";

export function POST() {
  const removed = clearCompleted();
  return NextResponse.json({ removed, todos: getTodos() });
}

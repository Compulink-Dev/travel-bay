"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export default function TodoPage() {
  type Todo = {
    _id: string;
    title: string;
    description?: string;
    dueDate?: string;
    completed: boolean;
  };
  const [items, setItems] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{
    title: string;
    description?: string;
    dueDate?: string;
    completed: boolean;
  }>({ title: "", description: "", dueDate: "", completed: false });
  const [editing, setEditing] = useState<Todo | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/todos");
      const data = await res.json();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    const payload: Record<string, unknown> = { ...form };
    if (form.dueDate) payload.dueDate = new Date(form.dueDate);
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/todos/${editing._id}` : "/api/todos";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      toast.success(editing ? "Todo updated" : "Todo created");
      setOpen(false);
      setForm({ title: "", description: "", dueDate: "", completed: false });
      setEditing(null);
      load();
    } else {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || "Failed");
    }
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Deleted");
      load();
    } else toast.error("Failed to delete");
  };

  const toggle = async (item: Todo) => {
    const res = await fetch(`/api/todos/${item._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !item.completed }),
    });
    if (res.ok) load();
  };

  const columns: ColumnDef<Todo>[] = [
    {
      accessorKey: "title",
      header: "Task",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => {
        const dueDate = row.getValue("dueDate") as string;
        return (
          <div>{dueDate ? new Date(dueDate).toLocaleDateString() : "—"}</div>
        );
      },
    },
    {
      accessorKey: "completed",
      header: "Status",
      cell: ({ row }) => {
        const completed = row.getValue("completed") as boolean;
        return (
          <Badge variant={completed ? "default" : "secondary"}>
            {completed ? "Completed" : "Pending"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const todo = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setEditing(todo);
                  setForm({
                    title: todo.title,
                    description: todo.description,
                    dueDate: todo.dueDate
                      ? new Date(todo.dueDate).toISOString().split("T")[0]
                      : "",
                    completed: todo.completed,
                  });
                  setOpen(true);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toggle(todo)}>
                {todo.completed ? "Mark as Pending" : "Mark as Completed"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => remove(todo._id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Todo</h1>
        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (!o) {
              setEditing(null);
              setForm({
                title: "",
                description: "",
                dueDate: "",
                completed: false,
              });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="button">New Task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Task" : "New Task"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
              <Input
                placeholder="Description"
                value={form.description || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
              <div className="grid grid-cols-2 gap-2 items-center">
                <Input
                  type="date"
                  value={form.dueDate || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dueDate: e.target.value }))
                  }
                />
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.completed}
                    onCheckedChange={(v) =>
                      setForm((f) => ({ ...f, completed: v }))
                    }
                  />
                  <span>Completed</span>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button className="button" onClick={submit}>
                  {editing ? "Save" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          searchKey="title"
          searchPlaceholder="Filter tasks..."
        />
      )}
    </div>
  );
}

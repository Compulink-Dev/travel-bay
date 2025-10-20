"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function TodoPage() {
  type Todo = { _id: string; title: string; description?: string; dueDate?: string; completed: boolean };
  const [items, setItems] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ title: string; description?: string; dueDate?: string; completed: boolean }>({ title: "", description: "", dueDate: "", completed: false });
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
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
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
    const res = await fetch(`/api/todos/${item._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed: !item.completed }) });
    if (res.ok) load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Todo</h1>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setForm({ title: "", description: "", dueDate: "", completed: false }); } }}>
          <DialogTrigger asChild>
            <Button>New Task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Task" : "New Task"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              <Input placeholder="Description" value={form.description || ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              <div className="grid grid-cols-2 gap-2 items-center">
                <Input type="date" value={form.dueDate || ""} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
                <div className="flex items-center gap-2">
                  <Switch checked={form.completed} onCheckedChange={(v) => setForm((f) => ({ ...f, completed: v }))} />
                  <span>Completed</span>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit}>{editing ? "Save" : "Create"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Task</th>
                <th className="p-2 text-left">Due</th>
                <th className="p-2 text-left">Completed</th>
                <th className="p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t._id} className="border-b hover:bg-muted/50">
                  <td className="p-2">{t.title}</td>
                  <td className="p-2">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}</td>
                  <td className="p-2">
                    <Switch checked={t.completed} onCheckedChange={() => toggle(t)} />
                  </td>
                  <td className="p-2 text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => { setEditing(t); setForm({ title: t.title, description: t.description, dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split("T")[0] : "", completed: t.completed }); setOpen(true); }}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(t._id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

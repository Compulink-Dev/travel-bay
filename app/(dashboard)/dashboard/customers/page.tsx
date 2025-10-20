"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function CustomersPage() {
  type Customer = { _id: string; name: string; email: string; phone: string };
  const [items, setItems] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ name: string; email: string; phone: string }>({ name: "", email: "", phone: "" });
  const [editing, setEditing] = useState<Customer | null>(null);

  const load = async () => { setLoading(true); try { const r = await fetch("/api/customers"); setItems(await r.json()); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/customers/${editing._id}` : "/api/customers";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { toast.success(editing ? "Customer updated" : "Customer created"); setOpen(false); setEditing(null); setForm({ name: "", email: "", phone: "" }); load(); } else toast.error("Failed");
  };
  const remove = async (id: string) => { const r = await fetch(`/api/customers/${id}`, { method: "DELETE" }); if (r.ok) { toast.success("Deleted"); load(); } else toast.error("Failed"); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Customers</h1>
        <Dialog open={open} onOpenChange={(o)=>{ setOpen(o); if (!o) { setEditing(null); setForm({ name: "", email: "", phone: "" }); } }}>
          <DialogTrigger asChild><Button>New Customer</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Customer" : "New Customer"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Name" value={form.name} onChange={(e)=>setForm(f=>({ ...f, name: e.target.value }))} />
              <Input placeholder="Email" value={form.email} onChange={(e)=>setForm(f=>({ ...f, email: e.target.value }))} />
              <Input placeholder="Phone" value={form.phone} onChange={(e)=>setForm(f=>({ ...f, phone: e.target.value }))} />
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={()=>setOpen(false)}>Cancel</Button>
                <Button onClick={submit}>{editing ? "Save" : "Create"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="overflow-x-auto">
        {loading ? <p className="text-muted-foreground">Loading...</p> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Phone</th>
                <th className="p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(c => (
                <tr key={c._id} className="border-b hover:bg-muted/50">
                  <td className="p-2">{c.name}</td>
                  <td className="p-2">{c.email}</td>
                  <td className="p-2">{c.phone}</td>
                  <td className="p-2 text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={()=>{ setEditing(c); setForm({ name: c.name, email: c.email, phone: c.phone }); setOpen(true); }}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={()=>remove(c._id)}>Delete</Button>
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

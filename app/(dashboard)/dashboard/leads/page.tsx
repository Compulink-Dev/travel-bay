"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function LeadsPage() {
  type Lead = { _id: string; name: string; contact: string; status: "new"|"contacted"|"won"|"lost"; notes?: string };
  const [items, setItems] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ name: string; contact: string; status: Lead["status"]; notes?: string }>({ name: "", contact: "", status: "new", notes: "" });
  const [editing, setEditing] = useState<Lead | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leads");
      setItems(await res.json());
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/leads/${editing._id}` : "/api/leads";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { toast.success(editing ? "Lead updated" : "Lead created"); setOpen(false); setEditing(null); setForm({ name: "", contact: "", status: "new", notes: "" }); load(); } else toast.error("Failed");
  };
  const remove = async (id: string) => { const r = await fetch(`/api/leads/${id}`, { method: "DELETE" }); if (r.ok) { toast.success("Deleted"); load(); } else toast.error("Failed"); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Leads</h1>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setForm({ name: "", contact: "", status: "new", notes: "" }); } }}>
          <DialogTrigger asChild><Button>New Lead</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Lead" : "New Lead"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Name" value={form.name} onChange={(e) => setForm(f=>({ ...f, name: e.target.value }))} />
              <Input placeholder="Contact" value={form.contact} onChange={(e) => setForm(f=>({ ...f, contact: e.target.value }))} />
              <Select value={form.status} onValueChange={(v: Lead["status"]) => setForm(f=>({ ...f, status: v }))}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
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
                <th className="p-2 text-left">Contact</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(l => (
                <tr key={l._id} className="border-b hover:bg-muted/50">
                  <td className="p-2">{l.name}</td>
                  <td className="p-2">{l.contact}</td>
                  <td className="p-2 capitalize">{l.status}</td>
                  <td className="p-2 text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => { setEditing(l); setForm({ name: l.name, contact: l.contact, status: l.status, notes: l.notes }); setOpen(true); }}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(l._id)}>Delete</Button>
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

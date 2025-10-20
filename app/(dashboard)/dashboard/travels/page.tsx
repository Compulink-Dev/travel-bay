"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function TravelsPage() {
  type Travel = { _id: string; name: string; contact: string; address: string; lat?: number; lng?: number };
  const [items, setItems] = useState<Travel[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ name: string; contact: string; address: string; lat?: string; lng?: string }>({ name: "", contact: "", address: "", lat: "", lng: "" });
  const [editing, setEditing] = useState<Travel | null>(null);

  const load = async () => { setLoading(true); try { const r = await fetch("/api/travels"); setItems(await r.json()); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    const payload: Record<string, unknown> = { name: form.name, contact: form.contact, address: form.address };
    if (form.lat) payload.lat = parseFloat(form.lat);
    if (form.lng) payload.lng = parseFloat(form.lng);
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/travels/${editing._id}` : "/api/travels";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) { toast.success(editing ? "Provider updated" : "Provider created"); setOpen(false); setEditing(null); setForm({ name: "", contact: "", address: "", lat: "", lng: "" }); load(); } else toast.error("Failed");
  };
  const remove = async (id: string) => { const r = await fetch(`/api/travels/${id}`, { method: "DELETE" }); if (r.ok) { toast.success("Deleted"); load(); } else toast.error("Failed"); };

  const mapUrl = (p: Travel) => `https://www.google.com/maps?q=${encodeURIComponent(p.address)}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Travel Providers</h1>
        <Dialog open={open} onOpenChange={(o)=>{ setOpen(o); if (!o) { setEditing(null); setForm({ name: "", contact: "", address: "", lat: "", lng: "" }); } }}>
          <DialogTrigger asChild><Button>New Provider</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Provider" : "New Provider"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Name" value={form.name} onChange={(e)=>setForm(f=>({ ...f, name: e.target.value }))} />
              <Input placeholder="Contact" value={form.contact} onChange={(e)=>setForm(f=>({ ...f, contact: e.target.value }))} />
              <Input placeholder="Address" value={form.address} onChange={(e)=>setForm(f=>({ ...f, address: e.target.value }))} />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Lat" value={form.lat} onChange={(e)=>setForm(f=>({ ...f, lat: e.target.value }))} />
                <Input placeholder="Lng" value={form.lng} onChange={(e)=>setForm(f=>({ ...f, lng: e.target.value }))} />
              </div>
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
                <th className="p-2 text-left">Contact</th>
                <th className="p-2 text-left">Address</th>
                <th className="p-2 text-left">Directions</th>
                <th className="p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(p => (
                <tr key={p._id} className="border-b hover:bg-muted/50">
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{p.contact}</td>
                  <td className="p-2">{p.address}</td>
                  <td className="p-2"><a href={mapUrl(p)} target="_blank" rel="noreferrer" className="text-primary underline">Open Maps</a></td>
                  <td className="p-2 text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={()=>{ setEditing(p); setForm({ name: p.name, contact: p.contact, address: p.address, lat: p.lat?.toString() || "", lng: p.lng?.toString() || "" }); setOpen(true); }}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={()=>remove(p._id)}>Delete</Button>
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

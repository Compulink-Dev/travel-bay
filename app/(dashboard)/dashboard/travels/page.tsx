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
import { toast } from "sonner";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, MapPin } from "lucide-react";

export default function TravelsPage() {
  type Travel = {
    _id: string;
    name: string;
    contact: string;
    address: string;
    lat?: number;
    lng?: number;
  };
  const [items, setItems] = useState<Travel[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    contact: string;
    address: string;
    lat?: string;
    lng?: string;
  }>({ name: "", contact: "", address: "", lat: "", lng: "" });
  const [editing, setEditing] = useState<Travel | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/travels");
      setItems(await r.json());
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    const payload: Record<string, unknown> = {
      name: form.name,
      contact: form.contact,
      address: form.address,
    };
    if (form.lat) payload.lat = parseFloat(form.lat);
    if (form.lng) payload.lng = parseFloat(form.lng);
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/travels/${editing._id}` : "/api/travels";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      toast.success(editing ? "Provider updated" : "Provider created");
      setOpen(false);
      setEditing(null);
      setForm({ name: "", contact: "", address: "", lat: "", lng: "" });
      load();
    } else toast.error("Failed");
  };
  const remove = async (id: string) => {
    const r = await fetch(`/api/travels/${id}`, { method: "DELETE" });
    if (r.ok) {
      toast.success("Deleted");
      load();
    } else toast.error("Failed");
  };

  const mapUrl = (p: Travel) =>
    `https://www.google.com/maps?q=${encodeURIComponent(p.address)}`;

  const columns: ColumnDef<Travel>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "contact",
      header: "Contact",
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => {
        const address = row.getValue("address") as string;
        return <div className="max-w-xs">{address}</div>;
      },
    },
    {
      id: "directions",
      header: "Directions",
      cell: ({ row }) => {
        const provider = row.original;
        return (
          <Button variant="outline" size="sm" asChild>
            <a href={mapUrl(provider)} target="_blank" rel="noreferrer">
              <MapPin className="h-4 w-4 mr-1" />
              Maps
            </a>
          </Button>
        );
      },
    },
    {
      id: "coordinates",
      header: "Coordinates",
      cell: ({ row }) => {
        const provider = row.original;
        return (
          <div className="text-xs text-muted-foreground">
            {provider.lat && provider.lng
              ? `${provider.lat.toFixed(4)}, ${provider.lng.toFixed(4)}`
              : "—"}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const provider = row.original;

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
                  setEditing(provider);
                  setForm({
                    name: provider.name,
                    contact: provider.contact,
                    address: provider.address,
                    lat: provider.lat?.toString() || "",
                    lng: provider.lng?.toString() || "",
                  });
                  setOpen(true);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => remove(provider._id)}
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
        <h1 className="text-xl font-semibold">Travel Providers</h1>
        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (!o) {
              setEditing(null);
              setForm({ name: "", contact: "", address: "", lat: "", lng: "" });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>New Provider</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Provider" : "New Provider"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
              <Input
                placeholder="Contact"
                value={form.contact}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contact: e.target.value }))
                }
              />
              <Input
                placeholder="Address"
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Latitude"
                  value={form.lat}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lat: e.target.value }))
                  }
                />
                <Input
                  placeholder="Longitude"
                  value={form.lng}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lng: e.target.value }))
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={submit}>{editing ? "Save" : "Create"}</Button>
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
          searchKey="name"
          searchPlaceholder="Filter providers..."
        />
      )}
    </div>
  );
}

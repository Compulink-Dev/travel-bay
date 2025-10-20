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
import { MoreHorizontal } from "lucide-react";

export default function CustomersPage() {
  type Customer = { _id: string; name: string; email: string; phone: string };
  const [items, setItems] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    email: string;
    phone: string;
  }>({ name: "", email: "", phone: "" });
  const [editing, setEditing] = useState<Customer | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/customers");
      setItems(await r.json());
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/customers/${editing._id}` : "/api/customers";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success(editing ? "Customer updated" : "Customer created");
      setOpen(false);
      setEditing(null);
      setForm({ name: "", email: "", phone: "" });
      load();
    } else toast.error("Failed");
  };
  const remove = async (id: string) => {
    const r = await fetch(`/api/customers/${id}`, { method: "DELETE" });
    if (r.ok) {
      toast.success("Deleted");
      load();
    } else toast.error("Failed");
  };

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const customer = row.original;

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
                  setEditing(customer);
                  setForm({
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone,
                  });
                  setOpen(true);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => remove(customer._id)}
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
        <h1 className="text-xl font-semibold">Customers</h1>
        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (!o) {
              setEditing(null);
              setForm({ name: "", email: "", phone: "" });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>New Customer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Customer" : "New Customer"}
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
                placeholder="Email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
              <Input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
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
          searchPlaceholder="Filter customers..."
        />
      )}
    </div>
  );
}

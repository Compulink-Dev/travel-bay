export default function LeadsPage() {
  const leads = [
    { id: 1, name: "Acme Corp", contact: "alice@acme.com", status: "New" },
  ];
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Leads</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Contact</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b hover:bg-muted/50">
                <td className="p-2">{l.name}</td>
                <td className="p-2">{l.contact}</td>
                <td className="p-2">{l.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
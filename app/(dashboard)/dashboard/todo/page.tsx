export default function TodoPage() {
  const todos = [
    { id: 1, title: "Follow up with John", due: "2025-10-25" },
  ];
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Todo</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Task</th>
              <th className="p-2 text-left">Due</th>
            </tr>
          </thead>
          <tbody>
            {todos.map((t) => (
              <tr key={t.id} className="border-b hover:bg-muted/50">
                <td className="p-2">{t.title}</td>
                <td className="p-2">{t.due}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default function TravelsPage() {
  type Provider = { id: number; name: string; contact: string; address: string; lat: number; lng: number };
  const providers: Provider[] = [
    { id: 1, name: "SkyWays", contact: "+1 555-3333", address: "789 Airport Rd, City", lat: 40.6413, lng: -73.7781 },
    { id: 2, name: "RoadRunners", contact: "+1 555-4444", address: "321 Bus Terminal, Town", lat: 34.0522, lng: -118.2437 },
  ];
  const mapUrl = (p: Provider) => `https://www.google.com/maps?q=${encodeURIComponent(p.address)}&ll=${p.lat},${p.lng}&z=15`;
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Travel Providers</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Contact</th>
              <th className="p-2 text-left">Address</th>
              <th className="p-2 text-left">Directions</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((p) => (
              <tr key={p.id} className="border-b hover:bg-muted/50">
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.contact}</td>
                <td className="p-2">{p.address}</td>
                <td className="p-2">
                  <a href={mapUrl(p)} target="_blank" rel="noreferrer" className="text-primary underline">
                    Open Maps
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
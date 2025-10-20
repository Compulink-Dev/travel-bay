export default function HotelsPage() {
  type Hotel = { id: number; name: string; contact: string; address: string; lat: number; lng: number };
  const hotels: Hotel[] = [
    { id: 1, name: "Grand Plaza", contact: "+1 555-1111", address: "123 Main St, City", lat: 40.7128, lng: -74.006 },
    { id: 2, name: "Seaside Resort", contact: "+1 555-2222", address: "456 Ocean Ave, Coast", lat: 34.0195, lng: -118.4912 },
  ];
  const mapUrl = (h: Hotel) => `https://www.google.com/maps?q=${encodeURIComponent(h.address)}&ll=${h.lat},${h.lng}&z=15`;
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Hotels</h1>
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
            {hotels.map((h) => (
              <tr key={h.id} className="border-b hover:bg-muted/50">
                <td className="p-2">{h.name}</td>
                <td className="p-2">{h.contact}</td>
                <td className="p-2">{h.address}</td>
                <td className="p-2">
                  <a href={mapUrl(h)} target="_blank" rel="noreferrer" className="text-primary underline">
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
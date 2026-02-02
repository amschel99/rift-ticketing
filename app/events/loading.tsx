export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="h-10 bg-gray-200 rounded animate-pulse mb-6 w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg h-64 animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

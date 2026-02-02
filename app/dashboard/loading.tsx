export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="h-10 bg-gray-200 rounded animate-pulse mb-6 w-1/3"></div>
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg h-32 animate-pulse"></div>
          ))}
        </div>
        <div className="bg-white rounded-lg h-64 animate-pulse"></div>
      </div>
    </div>
  );
}

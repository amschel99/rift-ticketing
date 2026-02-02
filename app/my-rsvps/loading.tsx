export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="h-10 bg-gray-200 rounded animate-pulse mb-6 w-1/3"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg h-24 animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StatCard({ title, value, icon: Icon, color = 'blue', loading = false }) {
  const colorMap = {
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    green: 'text-green-400 bg-green-400/10 border-green-400/20',
    purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    orange: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    red: 'text-red-400 bg-red-400/10 border-red-400/20',
  };

  if (loading) {
    return (
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
        <div className="skeleton h-4 w-24 mb-4" />
        <div className="skeleton h-8 w-20" />
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#3a3a3a] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <span className="text-gray-400 text-sm font-medium">{title}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${colorMap[color] || colorMap.blue}`}>
            <Icon size={17} />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white tracking-tight">
        {value !== undefined && value !== null ? value.toLocaleString() : '—'}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Link2, MousePointerClick, CheckCircle, Activity, BarChart2, ExternalLink, Copy } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard';
import { useDashboard } from '../hooks/useAnalytics';
import { useLinks } from '../hooks/useLinks';
import toast from 'react-hot-toast';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm shadow-lg">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        <p className="text-white font-semibold">{payload[0].value} clicks</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard({ onCreateLink }) {
  const { data: stats, loading: statsLoading } = useDashboard();
  const { links, loading: linksLoading } = useLinks();

  const BASE = import.meta.env.VITE_SHORT_URL_BASE || 'http://localhost:5000';
  const recentLinks = links.slice(0, 5);

  const copyLink = (shortCode) => {
    navigator.clipboard.writeText(`${BASE}/${shortCode}`);
    toast.success('Copied!');
  };

  const chartData = stats?.clicksChart?.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    clicks: d.clicks,
  })) || [];

  return (
    <div className="p-6 max-w-7xl mx-auto"> {/* ✅ CENTER FIX */}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm">Overview of your links and analytics</p>
        </div>

        <button
          onClick={onCreateLink}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition"
        >
          <Link2 size={16} />
          New Link
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"> {/* ✅ GRID FIX */}
        <StatCard title="Total Links" value={stats?.totalLinks} icon={Link2} color="blue" loading={statsLoading} />
        <StatCard title="Total Clicks" value={stats?.totalClicks} icon={MousePointerClick} color="green" loading={statsLoading} />
        <StatCard title="Active Links" value={stats?.activeLinks} icon={CheckCircle} color="purple" loading={statsLoading} />
        <StatCard title="Clicks Today" value={stats?.clicksToday} icon={Activity} color="orange" loading={statsLoading} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chart */}
        <div className="lg:col-span-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 shadow-md">
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 size={17} className="text-blue-400" />
            <h2 className="text-white font-medium text-sm">Clicks — Last 30 Days</h2>
          </div>

          {statsLoading ? (
            <div className="skeleton h-48 w-full" />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}> {/* ✅ HEIGHT FIX */}
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-600 text-sm">
              No click data yet
            </div>
          )}
        </div>

        {/* Recent Links */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 shadow-md">
          <div className="flex justify-between mb-4">
            <h2 className="text-white text-sm">Recent Links</h2>
            <Link to="/links" className="text-blue-400 text-xs hover:text-blue-300">
              View all →
            </Link>
          </div>

          {linksLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {recentLinks.map((link) => (
                <div key={link.shortCode} className="flex justify-between items-center border-b border-[#232323] pb-2">
                  <div className="truncate">
                    <p className="text-blue-400 text-xs">/{link.shortCode}</p>
                    <p className="text-gray-500 text-xs truncate">{link.originalUrl}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-white text-xs">{link.totalClicks || 0}</span>

                    <button onClick={() => copyLink(link.shortCode)}>
                      <Copy size={12} className="text-gray-500 hover:text-white" />
                    </button>

                    <Link to={`/links/${link.shortCode}`}>
                      <ExternalLink size={12} className="text-gray-500 hover:text-blue-400" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
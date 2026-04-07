import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MousePointerClick, Users, Globe, Smartphone,
  BarChart2, ExternalLink, Copy
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import StatCard from '../components/StatCard';
import { useAnalytics } from '../hooks/useAnalytics';
import { useLinks } from '../hooks/useLinks';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

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

const CustomBarTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm shadow-lg">
        <p className="text-white font-semibold">{payload[0].payload.name}</p>
        <p className="text-gray-400 text-xs">{payload[0].value} clicks ({payload[0].payload.percentage}%)</p>
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const {
    overview, clicks, geography, devices, referrers,
    loading, period, setPeriod, countryFilter, setCountryFilter
  } = useAnalytics(shortCode);

  const { links } = useLinks();
  const linkData = links.find((l) => l.shortCode === shortCode);
  const BASE = import.meta.env.VITE_SHORT_URL_BASE || 'http://localhost:5000';

  const copyLink = () => {
    navigator.clipboard.writeText(`${BASE}/${shortCode}`);
    toast.success('Copied!');
  };

  const chartData = clicks.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    clicks: d.clicks,
  }));

  if (loading) {
    return (
      <div className="p-6 max-w-6xl">
        <div className="skeleton h-6 w-48 mb-6" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <StatCard key={i} loading />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
              <div className="skeleton h-4 w-32 mb-4" />
              <div className="skeleton h-48 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/links')}
          className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-4 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to links
        </button>

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">/{shortCode}</h1>
              <button onClick={copyLink} className="text-gray-500 hover:text-white transition-colors">
                <Copy size={16} />
              </button>
              {linkData?.originalUrl && (
                <a href={linkData.originalUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-400 transition-colors">
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
            {linkData?.originalUrl && (
              <p className="text-gray-500 text-sm truncate max-w-xl">{linkData.originalUrl}</p>
            )}
          </div>

          {/* Period toggle */}
          <div className="flex bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-1 gap-1">
            {['7d', '30d', 'all'].map((p) => (
              <button
                key={p}
                onClick={() => { setPeriod(p); setCountryFilter(null); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  period === p
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                {p === 'all' ? 'All time' : p}
              </button>
            ))}
          </div>
        </div>

        {countryFilter && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-blue-400 text-xs bg-blue-600/10 border border-blue-600/20 px-3 py-1 rounded-full">
              Filtered: {countryFilter}
            </span>
            <button onClick={() => setCountryFilter(null)} className="text-gray-500 hover:text-white text-xs transition-colors">
              × Clear filter
            </button>
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Clicks" value={overview?.totalClicks} icon={MousePointerClick} color="blue" />
        <StatCard title="Unique Visitors" value={overview?.uniqueIPs} icon={Users} color="green" />
        <StatCard title="Top Country" value={overview?.topCountry} icon={Globe} color="purple" />
        <StatCard title="Top Device" value={overview?.topDevice} icon={Smartphone} color="orange" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Clicks over time */}
        <div className="lg:col-span-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 size={17} className="text-blue-400" />
            <h2 className="text-white font-medium text-sm">Clicks Over Time</h2>
            {countryFilter && (
              <span className="text-xs text-blue-400 ml-auto">— {countryFilter}</span>
            )}
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#666', fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-600 text-sm">No click data for this period</div>
          )}
        </div>

        {/* Geography */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Globe size={17} className="text-purple-400" />
            <h2 className="text-white font-medium text-sm">Top Countries</h2>
          </div>
          {geography.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={geography} layout="vertical">
                <XAxis type="number" tick={{ fill: '#666', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="country" tick={{ fill: '#aaa', fontSize: 11 }} tickLine={false} axisLine={false} width={80} />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar
                  dataKey="clicks"
                  fill="#8b5cf6"
                  radius={[0, 4, 4, 0]}
                  cursor="pointer"
                  onClick={(data) => setCountryFilter(data.country)}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-600 text-sm">No geography data</div>
          )}
          {geography.length > 0 && (
            <p className="text-gray-600 text-xs mt-2 text-center">Click a country to filter the timeline</p>
          )}
        </div>

        {/* Device Donut */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Smartphone size={17} className="text-green-400" />
            <h2 className="text-white font-medium text-sm">Device Types</h2>
          </div>
          {devices?.devices?.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={devices.devices}
                    dataKey="clicks"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                  >
                    {devices.devices.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val, name) => [`${val} clicks`, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {devices.devices.map((d, idx) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-gray-300 text-xs capitalize">{d.name}</span>
                    </div>
                    <span className="text-white text-xs font-medium">{d.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-600 text-sm">No device data</div>
          )}
        </div>

        {/* Browsers */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 size={17} className="text-orange-400" />
            <h2 className="text-white font-medium text-sm">Top Browsers</h2>
          </div>
          {devices?.browsers?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={devices.browsers.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#666', fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="clicks" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-600 text-sm">No browser data</div>
          )}
        </div>

        {/* Referrers Table */}
        <div className="lg:col-span-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <ExternalLink size={17} className="text-cyan-400" />
            <h2 className="text-white font-medium text-sm">Top Referrers</h2>
          </div>
          {referrers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-[#2a2a2a]">
                    <th className="text-left pb-3 font-medium">Domain</th>
                    <th className="text-right pb-3 font-medium">Clicks</th>
                    <th className="text-right pb-3 font-medium">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e1e1e]">
                  {referrers.map((r) => (
                    <tr key={r.domain} className="hover:bg-[#1e1e1e] transition-colors">
                      <td className="py-3 text-gray-300">{r.domain}</td>
                      <td className="py-3 text-white text-right font-medium">{r.clicks}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${r.percentage}%` }}
                            />
                          </div>
                          <span className="text-gray-500 text-xs w-10 text-right">{r.percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600 text-sm">No referrer data yet</div>
          )}
        </div>

      </div>
    </div>
  );
}

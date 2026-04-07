import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Copy, Trash2, BarChart2, ExternalLink,
  ToggleLeft, ToggleRight, Link2, ChevronLeft, ChevronRight, Clock
} from 'lucide-react';
import { useLinks } from '../hooks/useLinks';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function Links({ onCreateLink }) {
  const { links, pagination, loading, search, setSearch, fetchLinks, deleteLink, toggleActive } = useLinks();
  const [deletingCode, setDeletingCode] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const navigate = useNavigate();
  const BASE = import.meta.env.VITE_SHORT_URL_BASE || 'http://localhost:5000';

  const copyLink = (shortCode) => {
    navigator.clipboard.writeText(`${BASE}/${shortCode}`);
    toast.success('Copied!');
  };

  const handleDelete = async (shortCode) => {
    if (confirmDelete !== shortCode) {
      setConfirmDelete(shortCode);
      setTimeout(() => setConfirmDelete(null), 3000);
      return;
    }
    setDeletingCode(shortCode);
    try {
      await deleteLink(shortCode);
      setConfirmDelete(null);
    } finally {
      setDeletingCode(null);
    }
  };

  const handleToggle = async (shortCode, current) => {
    try {
      await toggleActive(shortCode, !current);
      toast.success(current ? 'Link disabled' : 'Link enabled');
    } catch {
      toast.error('Failed to update link');
    }
  };

  return (
    <div className="p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">All Links</h1>
          <p className="text-gray-500 text-sm mt-1">
            {pagination.total} link{pagination.total !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={onCreateLink}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
        >
          <Link2 size={16} />
          New Link
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search links..."
          className="w-full max-w-sm bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid grid-cols-12 px-5 py-3 border-b border-[#2a2a2a] text-xs text-gray-500 font-medium uppercase tracking-wider">
          <div className="col-span-3">Short Link</div>
          <div className="col-span-4">Destination</div>
          <div className="col-span-2">Created</div>
          <div className="col-span-1 text-center">Clicks</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-1 text-center">Actions</div>
        </div>

        {loading ? (
          <div className="divide-y divide-[#232323]">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-4 flex-1" />
                <div className="skeleton h-4 w-20" />
                <div className="skeleton h-4 w-12" />
              </div>
            ))}
          </div>
        ) : links.length === 0 ? (
          <div className="text-center py-16">
            <Link2 size={40} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No links found</p>
            {search && (
              <button onClick={() => setSearch('')} className="text-blue-400 text-sm mt-2 hover:text-blue-300">
                Clear search
              </button>
            )}
            {!search && (
              <button onClick={onCreateLink} className="text-blue-400 text-sm mt-2 hover:text-blue-300">
                Create your first link →
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#1e1e1e]">
            {links.map((link) => (
              <div
                key={link.shortCode}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-0 px-5 py-4 hover:bg-[#1e1e1e] transition-colors group"
              >
                {/* Short Link */}
                <div className="md:col-span-3 flex items-center gap-2">
                  <div className="min-w-0">
                    <button
                      onClick={() => navigate(`/links/${link.shortCode}`)}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors truncate block"
                    >
                      /{link.shortCode}
                    </button>
                    {link.title && (
                      <p className="text-gray-600 text-xs truncate mt-0.5">{link.title}</p>
                    )}
                  </div>
                  <button
                    onClick={() => copyLink(link.shortCode)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <Copy size={13} className="text-gray-500 hover:text-white" />
                  </button>
                </div>

                {/* Destination */}
                <div className="md:col-span-4 flex items-center gap-2 min-w-0 pr-4">
                  <p className="text-gray-400 text-sm truncate text-xs">{link.originalUrl}</p>
                  <a
                    href={link.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <ExternalLink size={12} className="text-gray-500 hover:text-blue-400" />
                  </a>
                </div>

                {/* Created */}
                <div className="md:col-span-2 flex items-center gap-1.5 text-gray-500 text-xs">
                  <Clock size={12} />
                  {link.createdAt ? format(new Date(link.createdAt), 'MMM d, yyyy') : '—'}
                </div>

                {/* Clicks */}
                <div className="md:col-span-1 flex items-center justify-center">
                  <button
                    onClick={() => navigate(`/links/${link.shortCode}`)}
                    className="flex items-center gap-1 text-white text-sm font-semibold hover:text-blue-400 transition-colors"
                  >
                    {link.totalClicks || 0}
                  </button>
                </div>

                {/* Status toggle */}
                <div className="md:col-span-1 flex items-center justify-center">
                  <button
                    onClick={() => handleToggle(link.shortCode, link.isActive)}
                    className="text-gray-500 hover:text-white transition-colors"
                    title={link.isActive ? 'Disable link' : 'Enable link'}
                  >
                    {link.isActive
                      ? <ToggleRight size={22} className="text-blue-400" />
                      : <ToggleLeft size={22} className="text-gray-600" />
                    }
                  </button>
                </div>

                {/* Actions */}
                <div className="md:col-span-1 flex items-center justify-center gap-2">
                  <button
                    onClick={() => navigate(`/links/${link.shortCode}`)}
                    title="View analytics"
                    className="text-gray-600 hover:text-blue-400 transition-colors"
                  >
                    <BarChart2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(link.shortCode)}
                    disabled={deletingCode === link.shortCode}
                    title={confirmDelete === link.shortCode ? 'Click again to confirm' : 'Delete'}
                    className={`transition-colors ${
                      confirmDelete === link.shortCode
                        ? 'text-red-400'
                        : 'text-gray-600 hover:text-red-400'
                    }`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-gray-600 text-xs">
            Page {pagination.page} of {pagination.pages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchLinks(pagination.page - 1, search)}
              className="px-3 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-gray-400 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchLinks(pagination.page + 1, search)}
              className="px-3 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-gray-400 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

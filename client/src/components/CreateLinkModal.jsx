import { useState, useEffect, useRef } from 'react';
import { X, Link, ExternalLink, Loader2, Check, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function CreateLinkModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState({ originalUrl: '', customAlias: '', title: '', expiresAt: '' });
  const [aliasStatus, setAliasStatus] = useState(null); // null | 'checking' | 'available' | 'taken'
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const inputRef = useRef(null);
  const aliasTimer = useRef(null);

  const BASE = import.meta.env.VITE_SHORT_URL_BASE || 'http://localhost:5000';

  useEffect(() => {
    if (isOpen) {
      setForm({ originalUrl: '', customAlias: '', title: '', expiresAt: '' });
      setErrors({});
      setAliasStatus(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));

    if (name === 'customAlias') {
      clearTimeout(aliasTimer.current);
      if (value.length >= 3) {
        setAliasStatus('checking');
        aliasTimer.current = setTimeout(async () => {
          try {
            const res = await api.get(`/urls/check-alias/${value}`);
            setAliasStatus(res.data.available ? 'available' : 'taken');
          } catch {
            setAliasStatus(null);
          }
        }, 400);
      } else {
        setAliasStatus(null);
      }
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.originalUrl) {
      errs.originalUrl = 'URL is required';
    } else {
      try { new URL(form.originalUrl); } catch { errs.originalUrl = 'Enter a valid URL (include https://)'; }
    }
    if (form.customAlias && aliasStatus === 'taken') {
      errs.customAlias = 'This alias is already taken';
    }
    if (form.customAlias && !/^[a-zA-Z0-9-]+$/.test(form.customAlias)) {
      errs.customAlias = 'Only letters, numbers, and hyphens allowed';
    }
    if (form.customAlias && form.customAlias.length < 3) {
      errs.customAlias = 'Alias must be at least 3 characters';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) return setErrors(errs);

    setLoading(true);
    try {
      const payload = {
        originalUrl: form.originalUrl,
        ...(form.customAlias ? { customAlias: form.customAlias } : {}),
        ...(form.title ? { title: form.title } : {}),
        ...(form.expiresAt ? { expiresAt: new Date(form.expiresAt).toISOString() } : {}),
      };
      const created = await api.post('/urls', payload);
      toast.success('Link created!');
      onCreated?.(created.data);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create link';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const aliasIcon = () => {
    if (aliasStatus === 'checking') return <Loader2 size={14} className="text-gray-400 animate-spin" />;
    if (aliasStatus === 'available') return <Check size={14} className="text-green-400" />;
    if (aliasStatus === 'taken') return <AlertCircle size={14} className="text-red-400" />;
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#161616] border border-[#2a2a2a] rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <Link size={18} className="text-blue-400" />
            <h2 className="text-white font-semibold">Create Short Link</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Original URL */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Destination URL *</label>
            <input
              ref={inputRef}
              type="text"
              name="originalUrl"
              value={form.originalUrl}
              onChange={handleChange}
              placeholder="https://example.com/your-long-url"
              className={`w-full bg-[#1a1a1a] border ${errors.originalUrl ? 'border-red-500' : 'border-[#2a2a2a]'} rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors`}
            />
            {errors.originalUrl && <p className="text-red-400 text-xs mt-1">{errors.originalUrl}</p>}
          </div>

          {/* Custom Alias */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Custom Alias (optional)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm select-none">
                {BASE.replace(/^https?:\/\//, '')}/
              </span>
              <input
                type="text"
                name="customAlias"
                value={form.customAlias}
                onChange={handleChange}
                placeholder="my-link"
                style={{ paddingLeft: `${(BASE.replace(/^https?:\/\//, '').length + 1) * 8 + 16}px` }}
                className={`w-full bg-[#1a1a1a] border ${errors.customAlias ? 'border-red-500' : aliasStatus === 'available' ? 'border-green-500' : 'border-[#2a2a2a]'} rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors pr-8`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">{aliasIcon()}</span>
            </div>
            {errors.customAlias && <p className="text-red-400 text-xs mt-1">{errors.customAlias}</p>}
            {aliasStatus === 'available' && !errors.customAlias && (
              <p className="text-green-400 text-xs mt-1">Alias is available</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Link Title (optional)</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Auto-fetched from URL if empty"
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Expiry */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Expiry Date (optional)</label>
            <input
              type="datetime-local"
              name="expiresAt"
              value={form.expiresAt}
              onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Preview */}
          {(form.originalUrl || form.customAlias) && (
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 flex items-center gap-2">
              <ExternalLink size={14} className="text-blue-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-blue-400 text-xs font-medium truncate">
                  {BASE}/{form.customAlias || '●●●●●●'}
                </p>
                {form.originalUrl && (
                  <p className="text-gray-500 text-xs truncate mt-0.5">{form.originalUrl}</p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-[#2a2a2a] text-gray-400 hover:text-white hover:border-[#3a3a3a] text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || aliasStatus === 'taken'}
              className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/40 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : 'Create Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

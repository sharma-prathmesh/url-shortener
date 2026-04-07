import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export function useLinks() {
  const [links, setLinks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLinks = useCallback(async (page = 1, searchTerm = '') => {
    try {
      setLoading(true);
      const res = await api.get('/urls', { params: { page, limit: 20, search: searchTerm } });
      setLinks(res.data.urls);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to load links');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchLinks(1, search), 300);
    return () => clearTimeout(timer);
  }, [search, fetchLinks]);

  const createLink = async (data) => {
    const res = await api.post('/urls', data);
    await fetchLinks(1, search);
    return res.data;
  };

  const deleteLink = async (shortCode) => {
    await api.delete(`/urls/${shortCode}`);
    setLinks((prev) => prev.filter((l) => l.shortCode !== shortCode));
    toast.success('Link deleted');
  };

  const toggleActive = async (shortCode, isActive) => {
    const res = await api.patch(`/urls/${shortCode}`, { isActive });
    setLinks((prev) =>
      prev.map((l) => (l.shortCode === shortCode ? { ...l, isActive: res.data.isActive } : l))
    );
  };

  return { links, pagination, loading, search, setSearch, fetchLinks, createLink, deleteLink, toggleActive };
}

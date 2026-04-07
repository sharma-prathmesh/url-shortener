import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export function useDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/dashboard/summary')
      .then((res) => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function useAnalytics(shortCode) {
  const [overview, setOverview] = useState(null);
  const [clicks, setClicks] = useState([]);
  const [geography, setGeography] = useState([]);
  const [devices, setDevices] = useState(null);
  const [referrers, setReferrers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [countryFilter, setCountryFilter] = useState(null);

  const fetchClicks = useCallback(async (p, country) => {
    const res = await api.get(`/analytics/${shortCode}/clicks`, {
      params: { period: p, ...(country ? { country } : {}) },
    });
    setClicks(res.data);
  }, [shortCode]);

  useEffect(() => {
    if (!shortCode) return;

    setLoading(true);
    Promise.all([
      api.get(`/analytics/${shortCode}/overview`),
      api.get(`/analytics/${shortCode}/clicks`, { params: { period } }),
      api.get(`/analytics/${shortCode}/geography`),
      api.get(`/analytics/${shortCode}/devices`),
      api.get(`/analytics/${shortCode}/referrers`),
    ])
      .then(([ov, cl, geo, dev, ref]) => {
        setOverview(ov.data);
        setClicks(cl.data);
        setGeography(geo.data);
        setDevices(dev.data);
        setReferrers(ref.data);
      })
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [shortCode]);

  useEffect(() => {
    if (!shortCode) return;
    fetchClicks(period, countryFilter);
  }, [period, countryFilter, fetchClicks, shortCode]);

  return {
    overview, clicks, geography, devices, referrers,
    loading, period, setPeriod, countryFilter, setCountryFilter,
  };
}

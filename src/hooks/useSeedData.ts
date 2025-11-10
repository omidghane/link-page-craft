import { useEffect, useState } from "react";
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 120000,
});

export function useSeedData() {
  const [rows, setRows] = useState<any[]>([]);
  const [vehs, setVehs] = useState<number[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchSeed() {
      setLoading(true);
      setError(null);
      try {
        const seed = await API.get("/api/map/seed");
        if (cancelled) return;
        setRows(seed.data?.df || []);
        setVehs(seed.data?.vehicles || []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to fetch seed data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchSeed();
    return () => {
      cancelled = true;
    };
  }, []);

  return { rows, vehs, loading, error };
}

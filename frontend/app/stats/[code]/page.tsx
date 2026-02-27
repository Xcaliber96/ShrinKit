"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface StatsData {
  total_clicks: number;
  created_at: string;
  original_url: string;
  top_referrers: { source: string; count: number }[];
}

export default function StatsPage() {
  const params = useParams();
  const shortCode = params.code as string;
  
  const [stats, setStats] = useState<StatsData | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`http://localhost:8000/stats/${shortCode}`);
        
        if (!response.ok) {
          throw new Error("Stats not found or link expired");
        }
        
        const data = await response.json();
        setStats(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (shortCode) {
      fetchStats();
    }
  }, [shortCode]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-black text-cyan-400 flex items-center justify-center font-mono">
        <p className="animate-pulse">LOADING_DATA_STREAM...</p>
      </main>
    );
  }

  if (error || !stats) {
    return (
      <main className="min-h-screen bg-black text-red-400 flex items-center justify-center font-mono">
        <p className="before:content-['>_ERROR:_']">{error || "DATA_NOT_FOUND"}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-gray-300 flex flex-col items-center py-20 px-4 font-sans selection:bg-fuchsia-500 selection:text-black relative overflow-hidden">
      
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="max-w-3xl w-full relative z-10 space-y-8">
        
        {/* Header */}
        <div className="border-b border-gray-800 pb-6">
          <p className="text-fuchsia-500 font-mono text-xs tracking-[0.2em] mb-2 uppercase">TELEMETRY_DATA</p>
          <h1 className="text-4xl font-mono font-bold text-cyan-400 tracking-tight">
            /{shortCode}
          </h1>
          <a href={stats.original_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 font-mono text-sm hover:text-gray-300 transition-colors mt-2 block truncate">
            {stats.original_url}
          </a>
        </div>

        {/* Big Data Readout */}
        <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-800 relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-transparent rounded-xl opacity-0 group-hover:opacity-10 transition duration-1000 blur pointer-events-none"></div>
          
          <p className="text-gray-600 font-mono text-xs tracking-widest mb-4">TOTAL_ENGAGEMENT</p>
          <div className="text-7xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            {stats.total_clicks}
          </div>
          <p className="text-cyan-600 font-mono text-xs mt-4 uppercase">
            CREATED: {new Date(stats.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Referrers List */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 bg-black/50">
            <h2 className="text-xs font-mono font-bold text-fuchsia-400 tracking-[0.2em]">TRAFFIC_SOURCES</h2>
          </div>
          
          {stats.top_referrers && stats.top_referrers.length > 0 ? (
            <ul className="divide-y divide-gray-800/50">
              {stats.top_referrers.map((ref, index) => (
                <li key={index} className="px-6 py-4 flex justify-between items-center">
                  <span className="text-gray-300 font-mono text-sm">{ref.source || "Direct / Unknown"}</span>
                  <span className="text-cyan-400 font-mono font-bold">{ref.count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-8 text-center text-gray-600 font-mono text-sm">
              NO_REFERRER_DATA_DETECTED
            </div>
          )}
        </div>
        
        <a href="/" className="inline-block mt-8 text-cyan-500 font-mono text-sm hover:text-cyan-400 hover:underline before:content-['<<_']">
          RETURN_TO_TERMINAL
        </a>

      </div>
    </main>
  );
}
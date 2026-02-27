"use client";

import { useState, useEffect } from "react";

interface RecentLink {
  short_url: string;
  original_url: string;
  created_at: string;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recentLinks, setRecentLinks] = useState<RecentLink[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("recentLinks");
    if (saved) {
      setRecentLinks(JSON.parse(saved));
    }
  }, []);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShortUrl("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url,
          custom_code: customCode || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to shorten URL");
      }

      setShortUrl(data.short_url);

      const newLink = {
        short_url: data.short_url,
        original_url: url,
        created_at: data.created_at || new Date().toISOString(),
      };

      const updatedLinks = [newLink, ...recentLinks.filter(l => l.short_url !== data.short_url)].slice(0, 5);
      
      setRecentLinks(updatedLinks);
      localStorage.setItem("recentLinks", JSON.stringify(updatedLinks));
      
      setUrl("");
      setCustomCode("");
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(">> LINK COPIED TO CLIPBOARD");
  };

  return (
    <main className="min-h-screen bg-black text-gray-300 flex flex-col items-center py-20 px-4 font-sans selection:bg-cyan-500 selection:text-black relative overflow-hidden">
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="max-w-xl w-full relative z-10">
        
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 mb-2 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
            ShrinKit
          </h1>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-md p-8 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.05)] border border-gray-800 mb-8 relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-2xl opacity-0 group-hover:opacity-20 transition duration-1000 blur pointer-events-none"></div>

          <form onSubmit={handleShorten} className="space-y-6 relative">
            <div>
              <label htmlFor="url" className="block text-xs font-mono text-cyan-400 tracking-widest uppercase mb-2">
                TARGET_URL
              </label>
              <input
                id="url"
                type="url"
                required
                placeholder="https://example.com/long-data-stream"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm placeholder-gray-700 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
              />
            </div>
            
            <div>
              <label htmlFor="customCode" className="block text-xs font-mono text-fuchsia-400 tracking-widest uppercase mb-2">
                CUSTOM_ALIAS (OPTIONAL)
              </label>
              <div className="flex rounded-lg border border-gray-800 overflow-hidden focus-within:border-fuchsia-500 focus-within:ring-1 focus-within:ring-fuchsia-500 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                <span className="bg-gray-950 px-4 py-3 text-gray-600 border-r border-gray-800 font-mono text-sm flex items-center select-none">
                  shrink.it/
                </span>
                <input
                  id="customCode"
                  type="text"
                  placeholder="custom-node"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  className="w-full bg-black px-4 py-3 outline-none text-gray-100 font-mono text-sm placeholder-gray-700"
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-xs font-mono tracking-wide before:content-['>_ERROR:_']">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-500 text-black font-mono tracking-widest font-bold uppercase py-3.5 rounded-lg hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all disabled:bg-gray-800 disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? "PROCESSING..." : "INITIALIZE_LINK"}
            </button>
          </form>

          {shortUrl && (
            <div className="mt-8 p-5 bg-black border border-cyan-500/50 rounded-lg flex items-center justify-between shadow-[inset_0_0_20px_rgba(34,211,238,0.1)]">
              <div className="overflow-hidden mr-4">
                <p className="text-[10px] text-cyan-600 font-mono font-bold tracking-[0.2em] mb-1">DATA_LINK_ESTABLISHED</p>
                <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-xl font-mono text-cyan-400 hover:text-cyan-300 hover:underline truncate block drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                  {shortUrl}
                </a>
              </div>
              <button 
                onClick={() => copyToClipboard(shortUrl)}
                className="shrink-0 px-5 py-2.5 bg-gray-900 border border-cyan-500/30 text-cyan-400 rounded hover:bg-cyan-500 hover:text-black font-mono text-xs font-bold tracking-wider transition-all hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]"
              >
                COPY
              </button>
            </div>
          )}
        </div>

        {recentLinks.length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800 bg-black/50">
              <h2 className="text-[10px] font-mono font-bold text-fuchsia-500 tracking-[0.2em]">LOCAL_CACHE // RECENT</h2>
            </div>
            <ul className="divide-y divide-gray-800/50">
              {recentLinks.map((link, index) => {
                const code = link.short_url.split('/').pop(); 
                return (
                  <li key={index} className="p-6 hover:bg-gray-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="overflow-hidden">
                      <a href={link.short_url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 font-mono text-lg hover:text-cyan-300 hover:underline block truncate">
                        {link.short_url}
                      </a>
                      <a href={link.original_url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 font-mono hover:text-gray-400 block truncate mt-1 max-w-sm">
                        {link.original_url}
                      </a>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <a 
                        href={`/stats/${code}`}
                        className="text-xs font-mono tracking-widest text-fuchsia-400 bg-black border border-gray-800 hover:border-fuchsia-400 hover:text-fuchsia-400 px-4 py-2 rounded transition-all flex items-center justify-center"
                      >
                        STATS
                      </a>
                      <button 
                        onClick={() => copyToClipboard(link.short_url)}
                        className="text-xs font-mono tracking-widest text-gray-400 bg-black border border-gray-800 hover:border-cyan-400 hover:text-cyan-400 px-4 py-2 rounded transition-all"
                      >
                        COPY
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
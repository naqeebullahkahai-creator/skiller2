import { useState, useEffect, useRef } from "react";
import { Search, X, Clock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MobileSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const RECENT_KEY = "fanzon_recent_searches";

const MobileSearchOverlay = ({ isOpen, onClose }: MobileSearchOverlayProps) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem(RECENT_KEY);
      if (saved) setRecentSearches(JSON.parse(saved));
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const handleSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    navigate(`/search?q=${encodeURIComponent(term.trim())}`);
    onClose();
  };

  const removeRecent = (term: string) => {
    const updated = recentSearches.filter(s => s !== term);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-background animate-in fade-in duration-200">
      {/* Search Header */}
      <div className="flex items-center gap-2 px-3 py-3 bg-primary safe-area-top">
        <button onClick={onClose} className="text-primary-foreground p-1">
          <ArrowLeft size={22} />
        </button>
        <form
          onSubmit={(e) => { e.preventDefault(); handleSearch(query); }}
          className="flex-1 relative"
        >
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full h-9 pl-9 pr-8 bg-white rounded-full text-sm text-foreground outline-none"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X size={14} className="text-muted-foreground" />
            </button>
          )}
        </form>
      </div>

      {/* Recent Searches */}
      <div className="p-4">
        {recentSearches.length > 0 && (
          <>
            <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Recent</h3>
            <div className="space-y-1">
              {recentSearches.map((term) => (
                <div key={term} className="flex items-center justify-between py-2.5 px-2 rounded-lg active:bg-muted transition-colors">
                  <button
                    onClick={() => handleSearch(term)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <Clock size={14} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">{term}</span>
                  </button>
                  <button onClick={() => removeRecent(term)} className="p-1">
                    <X size={14} className="text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileSearchOverlay;

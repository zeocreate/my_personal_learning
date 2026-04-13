import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useKnowledge } from '@/context/KnowledgeContext';
import { useDebounce } from '@/hooks/useDebounce';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const debouncedQuery = useDebounce(query, 200);
  const { searchNotes, categories } = useKnowledge();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      const target = event.target as Node;
      if (!wrapperRef.current.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    return searchNotes(debouncedQuery).slice(0, 8);
  }, [debouncedQuery, searchNotes]);

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || '';

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search notes, topics, tags..."
          className="w-full h-9 pl-9 pr-8 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="absolute top-full mt-2 w-full bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50"
          >
            {results.map(note => (
              <button
                key={note.id}
                onClick={() => { navigate(`/note/${note.id}`); setOpen(false); setQuery(''); }}
                className="w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b border-border/50 last:border-0"
              >
                <p className="text-sm font-medium text-foreground truncate">{note.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{getCategoryName(note.categoryId)}</p>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

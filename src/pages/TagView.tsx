import { useParams, Link } from 'react-router-dom';
import { useKnowledge } from '@/context/KnowledgeContext';
import { motion } from 'framer-motion';
import { Hash } from 'lucide-react';

export default function TagView() {
  const { name } = useParams<{ name: string }>();
  const { getNotesByTag, categories } = useKnowledge();
  const tagNotes = getNotesByTag(name || '');

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Hash className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">{name}</h1>
        <span className="text-sm text-muted-foreground">({tagNotes.length} notes)</span>
      </div>
      <div className="space-y-2">
        {tagNotes.map((note, i) => (
          <motion.div key={note.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={`/note/${note.id}`} className="block glass rounded-xl p-4 hover:bg-accent/30 transition-colors">
              <h3 className="text-sm font-semibold text-foreground">{note.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{categories.find(c => c.id === note.categoryId)?.name}</p>
            </Link>
          </motion.div>
        ))}
        {tagNotes.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No notes with this tag.</p>}
      </div>
    </div>
  );
}

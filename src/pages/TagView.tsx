import { useParams, Link, useNavigate } from 'react-router-dom';
import { useKnowledge } from '@/context/KnowledgeContext';
import { motion } from 'framer-motion';
import { Hash, Trash2 } from 'lucide-react';

export default function TagView() {
  const navigate = useNavigate();
  const { name } = useParams<{ name: string }>();
  const { getNotesByTag, categories, topics, tags, deleteTag } = useKnowledge();
  const tagNotes = getNotesByTag(name || '');
  const currentTag = tags.find((tag) => tag.name === (name || '').toLowerCase());

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">{name}</h1>
          <span className="text-sm text-muted-foreground">({tagNotes.length} notes)</span>
        </div>
        {currentTag && (
          <button
            onClick={() => {
              deleteTag(currentTag.id);
              navigate('/');
            }}
            className="h-8 rounded-md bg-destructive/90 px-3 text-xs font-medium text-destructive-foreground inline-flex items-center gap-1"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete Tag
          </button>
        )}
      </div>
      <div className="space-y-2">
        {tagNotes.map((note, i) => (
          <motion.div key={note.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={`/note/${note.id}`} className="block glass rounded-xl p-4 hover:bg-accent/30 transition-colors">
              <h3 className="text-sm font-semibold text-foreground">{note.title}</h3>
              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                <span>{categories.find(c => c.id === note.categoryId)?.name}</span>
                <span>·</span>
                <span>{topics.find(t => t.id === note.topicId)?.name}</span>
              </div>
            </Link>
          </motion.div>
        ))}
        {tagNotes.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No notes with this tag.</p>}
      </div>
    </div>
  );
}

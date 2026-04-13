import { useParams, Link, useNavigate } from 'react-router-dom';
import { useKnowledge } from '@/context/KnowledgeContext';
import { motion } from 'framer-motion';
import { Plus, Star, Pin, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function TopicView() {
  const { id } = useParams<{ id: string }>();
  const { topics, notes, categories, addNote, deleteNote, toggleFavorite, togglePin } = useKnowledge();
  const navigate = useNavigate();
  const topic = topics.find(t => t.id === id);
  const topicNotes = notes.filter(n => n.topicId === id);
  const category = categories.find(c => c.id === topic?.categoryId);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  if (!topic) return <div className="p-6 text-muted-foreground">Topic not found.</div>;

  const handleAdd = () => {
    if (newTitle.trim()) {
      const note = addNote(topic.id, topic.categoryId, newTitle.trim());
      setNewTitle(''); setShowAdd(false);
      navigate(`/note/${note.id}`);
    }
  };

  const pinned = topicNotes.filter(n => n.isPinned);
  const unpinned = topicNotes.filter(n => !n.isPinned);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Link to={`/category/${category?.id}`} className="hover:text-foreground transition-colors">{category?.icon} {category?.name}</Link>
          <span>/</span>
          <span className="text-foreground">{topic.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">{topic.name}</h1>
          <button onClick={() => setShowAdd(!showAdd)} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Plus className="h-4 w-4" /> New Note
          </button>
        </div>
        {topic.description && <p className="text-sm text-muted-foreground mt-1">{topic.description}</p>}
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-4">
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="Note title..." className="w-full h-9 px-3 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" autoFocus />
          <button onClick={handleAdd} className="mt-2 h-8 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">Create</button>
        </motion.div>
      )}

      {pinned.length > 0 && (
        <div>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><Pin className="h-3 w-3" /> Pinned</h2>
          <div className="space-y-2">
            {pinned.map(note => (
              <NoteCard key={note.id} note={note} onToggleFavorite={toggleFavorite} onTogglePin={togglePin} onDelete={deleteNote} />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {unpinned.map((note, i) => (
          <motion.div key={note.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <NoteCard note={note} onToggleFavorite={toggleFavorite} onTogglePin={togglePin} onDelete={deleteNote} />
          </motion.div>
        ))}
        {topicNotes.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No notes yet. Create your first note!</p>}
      </div>
    </div>
  );
}

function NoteCard({ note, onToggleFavorite, onTogglePin, onDelete }: { note: any; onToggleFavorite: (id: string) => void; onTogglePin: (id: string) => void; onDelete: (id: string) => void }) {
  return (
    <div className="glass rounded-xl p-4 group">
      <div className="flex items-start justify-between">
        <Link to={`/note/${note.id}`} className="flex-1">
          <h3 className="text-sm font-semibold text-foreground">{note.title}</h3>
          <div className="flex items-center gap-2 mt-1.5">
            {note.tags.map((tag: string) => (
              <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">#{tag}</span>
            ))}
            <span className="text-xs text-muted-foreground">{new Date(note.updatedAt).toLocaleDateString()}</span>
          </div>
        </Link>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onTogglePin(note.id)} className={`p-1 rounded ${note.isPinned ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            <Pin className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => onToggleFavorite(note.id)} className={`p-1 rounded ${note.isFavorite ? 'text-warning' : 'text-muted-foreground hover:text-foreground'}`}>
            <Star className={`h-3.5 w-3.5 ${note.isFavorite ? 'fill-warning' : ''}`} />
          </button>
          <button onClick={() => onDelete(note.id)} className="p-1 rounded text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

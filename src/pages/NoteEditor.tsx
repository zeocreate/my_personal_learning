import { useParams, Link, useNavigate } from 'react-router-dom';
import { useKnowledge } from '@/context/KnowledgeContext';
import { NoteBlock } from '@/types';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Pin, ArrowLeft, Plus, Trash2, Code, Type, Heading, CheckSquare, Link as LinkIcon, Hash, GripVertical } from 'lucide-react';

export default function NoteEditor() {
  const { id } = useParams<{ id: string }>();
  const { notes, categories, topics, updateNote, toggleFavorite, togglePin, viewNote, tags: allTags, addTag } = useKnowledge();
  const navigate = useNavigate();
  const note = notes.find(n => n.id === id);
  const category = categories.find(c => c.id === note?.categoryId);
  const topic = topics.find(t => t.id === note?.topicId);

  const [title, setTitle] = useState(note?.title || '');
  const [blocks, setBlocks] = useState<NoteBlock[]>(note?.blocks || []);
  const [noteTags, setNoteTags] = useState<string[]>(note?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [linkedNotes, setLinkedNotes] = useState<string[]>(note?.linkedNoteIds || []);
  const [showLinkPicker, setShowLinkPicker] = useState(false);

  useEffect(() => {
    if (note) viewNote(note.id);
  }, [note?.id]);

  useEffect(() => {
    if (note) {
      const timer = setTimeout(() => {
        updateNote(note.id, { title, blocks, tags: noteTags, linkedNoteIds: linkedNotes });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [title, blocks, noteTags, linkedNotes]);

  if (!note) return <div className="p-6 text-muted-foreground">Note not found.</div>;

  const addBlock = (type: NoteBlock['type']) => {
    const newBlock: NoteBlock = {
      id: crypto.randomUUID(),
      type,
      content: '',
      order: blocks.length,
      ...(type === 'code' ? { language: 'javascript' } : {}),
      ...(type === 'checklist' ? { checked: false } : {}),
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (blockId: string, updates: Partial<NoteBlock>) => {
    setBlocks(blocks.map(b => b.id === blockId ? { ...b, ...updates } : b));
  };

  const removeBlock = (blockId: string) => {
    setBlocks(blocks.filter(b => b.id !== blockId));
  };

  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !noteTags.includes(tag)) {
      setNoteTags([...noteTags, tag]);
      addTag(tag, 'hsl(168, 70%, 45%)');
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setNoteTags(noteTags.filter(t => t !== tag));
  };

  const linkNote = (noteId: string) => {
    if (!linkedNotes.includes(noteId)) {
      setLinkedNotes([...linkedNotes, noteId]);
    }
    setShowLinkPicker(false);
  };

  const unlinkNote = (noteId: string) => {
    setLinkedNotes(linkedNotes.filter(id => id !== noteId));
  };

  const otherNotes = notes.filter(n => n.id !== note.id && !linkedNotes.includes(n.id));
  const linked = notes.filter(n => linkedNotes.includes(n.id));

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <button onClick={() => navigate(-1)} className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Back
        </button>
        <span>/</span>
        <Link to={`/category/${category?.id}`} className="hover:text-foreground transition-colors">{category?.icon} {category?.name}</Link>
        <span>/</span>
        <Link to={`/topic/${topic?.id}`} className="hover:text-foreground transition-colors">{topic?.name}</Link>
      </div>

      {/* Title & actions */}
      <div className="flex items-center gap-3">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="flex-1 text-2xl font-bold bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          placeholder="Untitled Note"
        />
        <button onClick={() => togglePin(note.id)} className={`p-2 rounded-lg ${note.isPinned ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-accent'} transition-colors`}>
          <Pin className="h-4 w-4" />
        </button>
        <button onClick={() => toggleFavorite(note.id)} className={`p-2 rounded-lg ${note.isFavorite ? 'text-warning bg-warning/10' : 'text-muted-foreground hover:text-foreground hover:bg-accent'} transition-colors`}>
          <Star className={`h-4 w-4 ${note.isFavorite ? 'fill-warning' : ''}`} />
        </button>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        {noteTags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground">
            #{tag}
            <button onClick={() => removeTag(tag)} className="hover:text-destructive"><Trash2 className="h-2.5 w-2.5" /></button>
          </span>
        ))}
        <div className="flex items-center gap-1">
          <Hash className="h-3 w-3 text-muted-foreground" />
          <input
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddTag()}
            placeholder="add tag..."
            className="h-6 w-20 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      {/* Block toolbar */}
      <div className="flex items-center gap-1 border-b border-border pb-3">
        <span className="text-xs text-muted-foreground mr-2">Add block:</span>
        {[
          { type: 'text' as const, icon: Type, label: 'Text' },
          { type: 'heading' as const, icon: Heading, label: 'Heading' },
          { type: 'code' as const, icon: Code, label: 'Code' },
          { type: 'checklist' as const, icon: CheckSquare, label: 'Checklist' },
        ].map(({ type, icon: Icon, label }) => (
          <button key={type} onClick={() => addBlock(type)} className="h-7 px-2.5 rounded-md bg-secondary text-secondary-foreground text-xs flex items-center gap-1.5 hover:bg-accent transition-colors">
            <Icon className="h-3 w-3" /> {label}
          </button>
        ))}
      </div>

      {/* Blocks */}
      <div className="space-y-3">
        {blocks.sort((a, b) => a.order - b.order).map(block => (
          <motion.div key={block.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group relative">
            <div className="absolute -left-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
              <button onClick={() => removeBlock(block.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
            </div>
            {block.type === 'heading' && (
              <input
                value={block.content}
                onChange={e => updateBlock(block.id, { content: e.target.value })}
                className="w-full text-lg font-semibold bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                placeholder="Heading..."
              />
            )}
            {block.type === 'text' && (
              <textarea
                value={block.content}
                onChange={e => updateBlock(block.id, { content: e.target.value })}
                className="w-full min-h-[60px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none leading-relaxed"
                placeholder="Write something..."
              />
            )}
            {block.type === 'code' && (
              <div className="rounded-lg bg-muted border border-border overflow-hidden">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
                  <select
                    value={block.language || 'javascript'}
                    onChange={e => updateBlock(block.id, { language: e.target.value })}
                    className="text-xs bg-transparent text-muted-foreground focus:outline-none"
                  >
                    {['javascript', 'typescript', 'python', 'rust', 'go', 'html', 'css', 'sql', 'bash', 'json'].map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={block.content}
                  onChange={e => updateBlock(block.id, { content: e.target.value })}
                  className="w-full min-h-[80px] p-3 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
                  placeholder="// code here..."
                  spellCheck={false}
                />
              </div>
            )}
            {block.type === 'checklist' && (
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={block.checked || false}
                  onChange={e => updateBlock(block.id, { checked: e.target.checked })}
                  className="w-4 h-4 rounded border-border accent-primary"
                />
                <input
                  value={block.content}
                  onChange={e => updateBlock(block.id, { content: e.target.value })}
                  className={`flex-1 bg-transparent text-sm focus:outline-none ${block.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                  placeholder="Checklist item..."
                />
              </label>
            )}
          </motion.div>
        ))}
      </div>

      {/* Linked Notes */}
      <div className="pt-4 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <LinkIcon className="h-3 w-3" /> Linked Notes
          </h3>
          <button onClick={() => setShowLinkPicker(!showLinkPicker)} className="text-xs text-primary hover:underline">+ Link note</button>
        </div>
        {showLinkPicker && otherNotes.length > 0 && (
          <div className="glass rounded-lg p-2 mb-3 max-h-40 overflow-y-auto scrollbar-thin">
            {otherNotes.map(n => (
              <button key={n.id} onClick={() => linkNote(n.id)} className="w-full text-left px-3 py-1.5 text-sm text-foreground hover:bg-accent rounded transition-colors">
                {n.title}
              </button>
            ))}
          </div>
        )}
        <div className="space-y-1">
          {linked.map(n => (
            <div key={n.id} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-secondary">
              <Link to={`/note/${n.id}`} className="text-sm text-primary hover:underline">{n.title}</Link>
              <button onClick={() => unlinkNote(n.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Metadata */}
      <div className="pt-4 border-t border-border text-xs text-muted-foreground space-y-1">
        <p>Created: {new Date(note.createdAt).toLocaleString()}</p>
        <p>Updated: {new Date(note.updatedAt).toLocaleString()}</p>
        <p>Last viewed: {new Date(note.lastViewedAt).toLocaleString()}</p>
      </div>
    </div>
  );
}

import { useParams, Link, useNavigate } from 'react-router-dom';
import { useKnowledge } from '@/context/KnowledgeContext';
import { motion } from 'framer-motion';
import { Plus, FileText, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function CategoryView() {
  const { id } = useParams<{ id: string }>();
  const { categories, topics, notes, addTopic, deleteTopic } = useKnowledge();
  const navigate = useNavigate();
  const category = categories.find(c => c.id === id);
  const catTopics = topics.filter(t => t.categoryId === id);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  if (!category) return <div className="p-6 text-muted-foreground">Category not found.</div>;

  const handleAdd = () => {
    if (newName.trim()) {
      addTopic(category.id, newName.trim(), newDesc.trim());
      setNewName(''); setNewDesc(''); setShowAdd(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <span>{category.icon}</span> {category.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{catTopics.length} topics</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4" /> Add Topic
        </button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-4 space-y-3">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Topic name..." className="w-full h-9 px-3 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)..." className="w-full h-9 px-3 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          <button onClick={handleAdd} className="h-8 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">Create</button>
        </motion.div>
      )}

      <div className="space-y-3">
        {catTopics.map((topic, i) => {
          const topicNotes = notes.filter(n => n.topicId === topic.id);
          return (
            <motion.div key={topic.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/topic/${topic.id}`} className="block glass rounded-xl p-4 hover:bg-accent/30 transition-colors group">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{topic.name}</h3>
                    {topic.description && <p className="text-xs text-muted-foreground mt-0.5">{topic.description}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><FileText className="h-3 w-3" />{topicNotes.length}</span>
                    <button onClick={e => { e.preventDefault(); deleteTopic(topic.id); }} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
        {catTopics.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No topics yet. Create one to get started.</p>}
      </div>
    </div>
  );
}

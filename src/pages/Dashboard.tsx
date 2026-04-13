import { useKnowledge } from '@/context/KnowledgeContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, FolderOpen, Hash, TrendingUp, Clock, Star } from 'lucide-react';
import { MyTimeTracking } from '@/components/MyTimeTracking';

export default function Dashboard() {
  const { getAnalytics, getRecentNotes, getFavorites, categories } = useKnowledge();
  const analytics = getAnalytics();
  const recent = getRecentNotes(6);
  const favorites = getFavorites();

  const stats = [
    { label: 'Total Notes', value: analytics.totalNotes, icon: FileText, color: 'text-primary' },
    { label: 'Categories', value: analytics.totalCategories, icon: FolderOpen, color: 'text-info' },
    { label: 'Topics', value: analytics.totalTopics, icon: TrendingUp, color: 'text-success' },
    { label: 'Tags', value: analytics.totalTags, icon: Hash, color: 'text-warning' },
  ];

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || '';

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Your knowledge at a glance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {analytics.mostUsedCategory !== 'N/A' && (
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Most used category</p>
          <p className="text-lg font-semibold text-foreground mt-1">{analytics.mostUsedCategory}</p>
        </div>
      )}

      <MyTimeTracking />

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" /> Recently Edited
          </h2>
          <div className="space-y-2">
            {recent.map((note, i) => (
              <motion.div key={note.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/note/${note.id}`} className="block glass rounded-lg p-3 hover:bg-accent/50 transition-colors">
                  <p className="text-sm font-medium text-foreground truncate">{note.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{getCategoryName(note.categoryId)}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{new Date(note.updatedAt).toLocaleDateString()}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
            {recent.length === 0 && <p className="text-sm text-muted-foreground">No notes yet. Create one!</p>}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Star className="h-4 w-4" /> Favorites
          </h2>
          <div className="space-y-2">
            {favorites.map((note, i) => (
              <motion.div key={note.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/note/${note.id}`} className="block glass rounded-lg p-3 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                    <p className="text-sm font-medium text-foreground truncate">{note.title}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
            {favorites.length === 0 && <p className="text-sm text-muted-foreground">No favorites yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

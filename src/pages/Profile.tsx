import { useEffect, useState } from 'react';
import { useKnowledge } from '@/context/KnowledgeContext';
import { motion } from 'framer-motion';
import { User, Mail, Code, Calendar, BarChart3, FileText, FolderOpen, Hash, Star } from 'lucide-react';

export default function Profile() {
  const { getAnalytics, getFavorites, categories, tags } = useKnowledge();
  const analytics = getAnalytics();
  const favorites = getFavorites();

  useEffect(() => {
    localStorage.removeItem('dev-hub-profile');
    localStorage.removeItem('dev-hub-profile-v2');
  }, []);

  const [profile, setProfile] = useState({ name: '', email: '', bio: '', avatar: '' });

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(profile);

  const handleSave = () => {
    setProfile(form);
    setEditing(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Profile</h1>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <User className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1 space-y-4">
            {editing ? (
              <>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Name</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full h-9 px-3 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Email</label>
                    <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full h-9 px-3 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Bio</label>
                    <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="w-full min-h-[60px] px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary mt-1 resize-none" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} className="h-8 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">Save</button>
                  <button onClick={() => { setForm(profile); setEditing(false); }} className="h-8 px-4 rounded-lg bg-secondary text-secondary-foreground text-sm hover:bg-accent transition-colors">Cancel</button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{profile.name}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5"><Mail className="h-3.5 w-3.5" />{profile.email}</p>
                  {profile.bio && <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5"><Code className="h-3.5 w-3.5" />{profile.bio}</p>}
                </div>
                <button onClick={() => setEditing(true)} className="h-8 px-4 rounded-lg bg-secondary text-secondary-foreground text-sm hover:bg-accent transition-colors">Edit Profile</button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats overview */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4" /> Your Stats
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Notes', value: analytics.totalNotes, icon: FileText },
            { label: 'Categories', value: analytics.totalCategories, icon: FolderOpen },
            { label: 'Tags', value: analytics.totalTags, icon: Hash },
            { label: 'Favorites', value: favorites.length, icon: Star },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-xl p-3 text-center">
              <stat.icon className="h-4 w-4 text-primary mx-auto mb-1.5" />
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Activity */}
      <div className="glass rounded-xl p-4">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" /> Top Categories
        </h3>
        <div className="space-y-2">
          {categories.map(cat => {
            const count = analytics.recentlyEdited.filter(n => n.categoryId === cat.id).length;
            return (
              <div key={cat.id} className="flex items-center justify-between text-sm">
                <span className="text-foreground flex items-center gap-2">{cat.icon} {cat.name}</span>
                <span className="text-muted-foreground text-xs">{count} recent</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

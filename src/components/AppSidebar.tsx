import { Link, useLocation } from 'react-router-dom';
import { useKnowledge } from '@/context/KnowledgeContext';
import { LayoutDashboard, FolderOpen, Star, Hash, ChevronRight, Plus, BookOpen, Trash2, User } from 'lucide-react';
import { useState } from 'react';

export function AppSidebar() {
  const { categories, getFavorites, tags, addCategory, deleteCategory } = useKnowledge();
  const location = useLocation();
  const favorites = getFavorites();
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const isActive = (path: string) => location.pathname === path;

  const handleAddCategory = () => {
    if (newCatName.trim()) {
      addCategory(newCatName.trim(), '📁', 'hsl(168, 70%, 45%)');
      setNewCatName('');
      setShowAddCategory(false);
    }
  };

  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden shrink-0">
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground text-sm tracking-tight">Personal tracker</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1">
        <Link
          to="/"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${isActive('/') ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'}`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>

        <Link
          to="/profile"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${isActive('/profile') ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'}`}
        >
          <User className="h-4 w-4" />
          Profile
        </Link>

        <div className="pt-4">
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Categories</span>
            <button onClick={() => setShowAddCategory(!showAddCategory)} className="text-muted-foreground hover:text-foreground">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          {showAddCategory && (
            <div className="px-3 mb-2">
              <input
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                placeholder="Category name..."
                className="w-full h-7 px-2 text-xs rounded bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
            </div>
          )}
          {categories.map(cat => (
            <div key={cat.id} className="group flex items-center">
              <Link
                to={`/category/${cat.id}`}
                className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${isActive(`/category/${cat.id}`) ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'}`}
              >
                <span>{cat.icon}</span>
                <span className="truncate">{cat.name}</span>
                <ChevronRight className="h-3 w-3 ml-auto opacity-40" />
              </Link>
              <button
                onClick={() => deleteCategory(cat.id)}
                className="opacity-0 group-hover:opacity-100 p-1 mr-1 text-muted-foreground hover:text-destructive transition-all"
                title="Delete category"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        {favorites.length > 0 && (
          <div className="pt-4">
            <span className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Favorites</span>
            {favorites.map(note => (
              <Link
                key={note.id}
                to={`/note/${note.id}`}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors mt-1"
              >
                <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                <span className="truncate">{note.title}</span>
              </Link>
            ))}
          </div>
        )}

        {tags.length > 0 && (
          <div className="pt-4">
            <span className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Tags</span>
            <div className="flex flex-wrap gap-1.5 px-3 mt-2">
              {tags.map(tag => (
                <Link
                  key={tag.id}
                  to={`/tag/${tag.name}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
                >
                  <Hash className="h-2.5 w-2.5" />
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}

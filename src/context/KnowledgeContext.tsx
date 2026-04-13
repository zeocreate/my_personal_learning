import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Category, Topic, Note, Tag, LearningSession, TimeTracking, LearningProgress } from '@/types';
import { api } from '@/lib/api';

const genId = () => crypto.randomUUID();
const now = () => new Date().toISOString();

interface KnowledgeState {
  categories: Category[];
  topics: Topic[];
  notes: Note[];
  tags: Tag[];
  learningSessions: LearningSession[];
  learningProgress: LearningProgress[];
  timeTracking: TimeTracking[];
}

interface KnowledgeContextType extends KnowledgeState {
  addCategory: (name: string, icon: string, color: string) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addTopic: (categoryId: string, name: string, description: string) => Topic;
  updateTopic: (id: string, updates: Partial<Topic>) => void;
  deleteTopic: (id: string) => void;
  addNote: (topicId: string, categoryId: string, title: string) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  toggleFavorite: (id: string) => void;
  togglePin: (id: string) => void;
  viewNote: (id: string) => void;
  addTag: (name: string, color: string) => Tag;
  deleteTag: (id: string) => void;
  searchNotes: (query: string) => Note[];
  getNotesByTag: (tagName: string) => Note[];
  getFavorites: () => Note[];
  getRecentNotes: (limit?: number) => Note[];
  getAnalytics: () => { totalNotes: number; totalCategories: number; totalTopics: number; totalTags: number; mostUsedCategory: string; recentlyEdited: Note[] };
  // Learning tracking functions
  startLearningSession: (categoryId: string, title: string) => LearningSession;
  pauseLearningSession: (sessionId: string) => void;
  resumeLearningSession: (sessionId: string) => void;
  completeLearningSession: (sessionId: string) => void;
  updateLearningProgress: (sessionId: string, noteId: string, progressPercentage: number) => void;
  getActiveLearningSession: () => LearningSession | null;
  getTodayTimeTracking: () => TimeTracking | null;
  updateTimeTracking: (date: string, categoryId: string | null, minutes: number) => void;
}

const KnowledgeContext = createContext<KnowledgeContextType | null>(null);

const emptyState: KnowledgeState = {
  categories: [],
  topics: [],
  notes: [],
  tags: [],
  learningSessions: [],
  learningProgress: [],
  timeTracking: [],
};

export function KnowledgeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<KnowledgeState>(emptyState);

  const syncFromServer = useCallback(async () => {
    const serverState = await api.getState() as KnowledgeState;
    setState({
      categories: serverState.categories || [],
      topics: serverState.topics || [],
      notes: serverState.notes || [],
      tags: serverState.tags || [],
      learningSessions: serverState.learningSessions || [],
      learningProgress: serverState.learningProgress || [],
      timeTracking: serverState.timeTracking || [],
    });
  }, []);

  useEffect(() => {
    void syncFromServer().catch((error) => {
      console.error('Failed to load from MySQL API:', error);
    });

    localStorage.removeItem('knowledge-hub');
    localStorage.removeItem('knowledge-hub-v2');
  }, [syncFromServer]);

  const addCategory = useCallback((name: string, icon: string, color: string) => {
    const cat: Category = { id: genId(), name, icon, color, createdAt: now(), updatedAt: now() };
    setState(s => ({ ...s, categories: [...s.categories, cat] }));
    void api.createCategory(cat).catch(() => void syncFromServer());
    return cat;
  }, [syncFromServer]);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setState(s => ({ ...s, categories: s.categories.map(c => c.id === id ? { ...c, ...updates, updatedAt: now() } : c) }));
    const current = state.categories.find((c) => c.id === id);
    if (!current) return;
    void api.updateCategory(id, { ...current, ...updates }).catch(() => void syncFromServer());
  }, [state.categories, syncFromServer]);

  const deleteCategory = useCallback((id: string) => {
    setState(s => ({
      ...s,
      categories: s.categories.filter(c => c.id !== id),
      topics: s.topics.filter(t => t.categoryId !== id),
      notes: s.notes.filter(n => n.categoryId !== id),
    }));
    void api.deleteCategory(id).catch(() => void syncFromServer());
  }, [syncFromServer]);

  const addTopic = useCallback((categoryId: string, name: string, description: string) => {
    const topic: Topic = { id: genId(), categoryId, name, description, createdAt: now(), updatedAt: now() };
    setState(s => ({ ...s, topics: [...s.topics, topic] }));
    void api.createTopic(topic).catch(() => void syncFromServer());
    return topic;
  }, [syncFromServer]);

  const updateTopic = useCallback((id: string, updates: Partial<Topic>) => {
    setState(s => ({ ...s, topics: s.topics.map(t => t.id === id ? { ...t, ...updates, updatedAt: now() } : t) }));
    const current = state.topics.find((t) => t.id === id);
    if (!current) return;
    void api.updateTopic(id, { ...current, ...updates }).catch(() => void syncFromServer());
  }, [state.topics, syncFromServer]);

  const deleteTopic = useCallback((id: string) => {
    setState(s => ({
      ...s,
      topics: s.topics.filter(t => t.id !== id),
      notes: s.notes.filter(n => n.topicId !== id),
    }));
    void api.deleteTopic(id).catch(() => void syncFromServer());
  }, [syncFromServer]);

  const addNote = useCallback((topicId: string, categoryId: string, title: string) => {
    const note: Note = {
      id: genId(), topicId, categoryId, title,
      blocks: [{ id: genId(), type: 'text', content: '', order: 0 }],
      tags: [], linkedNoteIds: [], isFavorite: false, isPinned: false,
      createdAt: now(), updatedAt: now(), lastViewedAt: now(),
    };
    setState(s => ({ ...s, notes: [...s.notes, note] }));
    void api.createNote(note).catch(() => void syncFromServer());
    return note;
  }, [syncFromServer]);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setState(s => ({ ...s, notes: s.notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: now() } : n) }));
    const current = state.notes.find((n) => n.id === id);
    if (!current) return;
    void api.updateNote(id, { ...current, ...updates }).catch(() => void syncFromServer());
  }, [state.notes, syncFromServer]);

  const deleteNote = useCallback((id: string) => {
    setState(s => ({ ...s, notes: s.notes.filter(n => n.id !== id) }));
    void api.deleteNote(id).catch(() => void syncFromServer());
  }, [syncFromServer]);

  const toggleFavorite = useCallback((id: string) => {
    setState(s => ({ ...s, notes: s.notes.map(n => n.id === id ? { ...n, isFavorite: !n.isFavorite, updatedAt: now() } : n) }));
    void api.toggleFavorite(id).catch(() => void syncFromServer());
  }, [syncFromServer]);

  const togglePin = useCallback((id: string) => {
    setState(s => ({ ...s, notes: s.notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned, updatedAt: now() } : n) }));
    void api.togglePin(id).catch(() => void syncFromServer());
  }, [syncFromServer]);

  const viewNote = useCallback((id: string) => {
    setState(s => ({ ...s, notes: s.notes.map(n => n.id === id ? { ...n, lastViewedAt: now() } : n) }));
    void api.viewNote(id).catch(() => void syncFromServer());
  }, [syncFromServer]);

  const addTag = useCallback((name: string, color: string) => {
    const existing = state.tags.find(t => t.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;
    const tag: Tag = { id: genId(), name: name.toLowerCase(), color };
    setState(s => ({ ...s, tags: [...s.tags, tag] }));
    void api.createTag(tag).catch(() => void syncFromServer());
    return tag;
  }, [state.tags, syncFromServer]);

  const deleteTag = useCallback((id: string) => {
    setState(s => ({ ...s, tags: s.tags.filter(t => t.id !== id) }));
    void api.deleteTag(id).catch(() => void syncFromServer());
  }, [syncFromServer]);

  const searchNotes = useCallback((query: string) => {
    const q = query.toLowerCase();
    return state.notes.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.blocks.some(b => b.content.toLowerCase().includes(q)) ||
      n.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [state.notes]);

  const getNotesByTag = useCallback((tagName: string) => {
    return state.notes.filter(n => n.tags.includes(tagName.toLowerCase()));
  }, [state.notes]);

  const getFavorites = useCallback(() => {
    return state.notes.filter(n => n.isFavorite);
  }, [state.notes]);

  const getRecentNotes = useCallback((limit = 5) => {
    return [...state.notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, limit);
  }, [state.notes]);

  const getAnalytics = useCallback(() => {
    const catCounts: Record<string, number> = {};
    state.notes.forEach(n => { catCounts[n.categoryId] = (catCounts[n.categoryId] || 0) + 1; });
    const mostUsedCatId = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const mostUsedCategory = state.categories.find(c => c.id === mostUsedCatId)?.name || 'N/A';
    return {
      totalNotes: state.notes.length,
      totalCategories: state.categories.length,
      totalTopics: state.topics.length,
      totalTags: state.tags.length,
      mostUsedCategory,
      recentlyEdited: getRecentNotes(5),
    };
  }, [state, getRecentNotes]);

  // Learning session functions
  const startLearningSession = useCallback((categoryId: string, title: string) => {
    const session: LearningSession = {
      id: genId(),
      categoryId,
      title,
      status: 'active',
      startedAt: now(),
      pausedAt: null,
      completedAt: null,
      totalDurationMinutes: 0,
      notes: '',
      createdAt: now(),
      updatedAt: now(),
    };
    setState(s => ({ ...s, learningSessions: [...s.learningSessions, session] }));
    void api.startLearningSession(session).catch(() => void syncFromServer());
    return session;
  }, [syncFromServer]);

  const pauseLearningSession = useCallback((sessionId: string) => {
    setState(s => ({
      ...s,
      learningSessions: s.learningSessions.map(ls => 
        ls.id === sessionId 
          ? { ...ls, status: 'paused' as const, pausedAt: now(), updatedAt: now() }
          : ls
      ),
    }));
    void api.pauseLearningSession(sessionId).catch(() => void syncFromServer());
  }, [syncFromServer]);

  const resumeLearningSession = useCallback((sessionId: string) => {
    setState(s => ({
      ...s,
      learningSessions: s.learningSessions.map(ls => 
        ls.id === sessionId 
          ? { ...ls, status: 'active' as const, pausedAt: null, updatedAt: now() }
          : ls
      ),
    }));
    void api.resumeLearningSession(sessionId).catch(() => void syncFromServer());
  }, [syncFromServer]);

  const completeLearningSession = useCallback((sessionId: string) => {
    setState(s => ({
      ...s,
      learningSessions: s.learningSessions.map(ls => 
        ls.id === sessionId 
          ? { ...ls, status: 'completed' as const, completedAt: now(), updatedAt: now() }
          : ls
      ),
    }));
    void api.completeLearningSession(sessionId).catch(() => void syncFromServer());
  }, [syncFromServer]);

  const updateLearningProgress = useCallback((sessionId: string, noteId: string, progressPercentage: number) => {
    setState(s => {
      const existingProgress = s.learningProgress.find(lp => lp.sessionId === sessionId && lp.noteId === noteId);
      if (existingProgress) {
        return {
          ...s,
          learningProgress: s.learningProgress.map(lp =>
            lp.id === existingProgress.id
              ? { ...lp, progressPercentage, lastAccessedAt: now(), updatedAt: now() }
              : lp
          ),
        };
      } else {
        const newProgress: LearningProgress = {
          id: genId(),
          sessionId,
          noteId,
          progressPercentage,
          lastAccessedAt: now(),
          createdAt: now(),
          updatedAt: now(),
        };
        return {
          ...s,
          learningProgress: [...s.learningProgress, newProgress],
        };
      }
    });
    void api.updateLearningProgress({ sessionId, noteId, progressPercentage }).catch(() => void syncFromServer());
  }, [syncFromServer]);

  const getActiveLearningSession = useCallback(() => {
    return state.learningSessions.find(ls => ls.status === 'active') || null;
  }, [state.learningSessions]);

  const getTodayTimeTracking = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return state.timeTracking.find(tt => tt.date === today) || null;
  }, [state.timeTracking]);

  const updateTimeTracking = useCallback((date: string, categoryId: string | null, minutes: number) => {
    setState(s => {
      const existing = s.timeTracking.find(tt => tt.date === date && tt.categoryId === categoryId);
      if (existing) {
        return {
          ...s,
          timeTracking: s.timeTracking.map(tt =>
            tt.id === existing.id
              ? {
                  ...tt,
                  totalLearningMinutes: tt.totalLearningMinutes + minutes,
                  sessionsCount: tt.sessionsCount + 1,
                  updatedAt: now(),
                }
              : tt
          ),
        };
      } else {
        const newTracking: TimeTracking = {
          id: genId(),
          date,
          totalLearningMinutes: minutes,
          sessionsCount: 1,
          categoryId,
          notes: '',
          createdAt: now(),
          updatedAt: now(),
        };
        return {
          ...s,
          timeTracking: [...s.timeTracking, newTracking],
        };
      }
    });
    void api.upsertTimeTracking({ date, categoryId, minutes }).catch(() => void syncFromServer());
  }, [syncFromServer]);

  return (
    <KnowledgeContext.Provider value={{
      ...state,
      addCategory, updateCategory, deleteCategory,
      addTopic, updateTopic, deleteTopic,
      addNote, updateNote, deleteNote, toggleFavorite, togglePin, viewNote,
      addTag, deleteTag, searchNotes, getNotesByTag, getFavorites, getRecentNotes, getAnalytics,
      startLearningSession, pauseLearningSession, resumeLearningSession, completeLearningSession,
      updateLearningProgress, getActiveLearningSession, getTodayTimeTracking, updateTimeTracking,
    }}>
      {children}
    </KnowledgeContext.Provider>
  );
}

export const useKnowledge = () => {
  const ctx = useContext(KnowledgeContext);
  if (!ctx) throw new Error('useKnowledge must be used within KnowledgeProvider');
  return ctx;
};

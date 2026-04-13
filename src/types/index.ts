export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteBlock {
  id: string;
  type: 'text' | 'code' | 'heading' | 'checklist';
  content: string;
  language?: string;
  checked?: boolean;
  order: number;
}

export interface Note {
  id: string;
  topicId: string;
  categoryId: string;
  title: string;
  blocks: NoteBlock[];
  tags: string[];
  linkedNoteIds: string[];
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  lastViewedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface LearningSession {
  id: string;
  categoryId: string;
  title: string;
  status: 'active' | 'paused' | 'completed';
  startedAt: string;
  pausedAt: string | null;
  completedAt: string | null;
  totalDurationMinutes: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface LearningProgress {
  id: string;
  sessionId: string;
  noteId: string | null;
  progressPercentage: number;
  lastAccessedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeTracking {
  id: string;
  date: string;
  totalLearningMinutes: number;
  sessionsCount: number;
  categoryId: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

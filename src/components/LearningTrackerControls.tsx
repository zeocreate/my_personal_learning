import { useEffect, useMemo, useState } from 'react';
import { Pause, Play, Square, Timer } from 'lucide-react';
import { useKnowledge } from '@/context/KnowledgeContext';

const toDateKey = (value = new Date()) => value.toISOString().split('T')[0];

export function LearningTrackerControls() {
  const {
    categories,
    learningSessions,
    startLearningSession,
    pauseLearningSession,
    resumeLearningSession,
    completeLearningSession,
    updateTimeTracking,
  } = useKnowledge();

  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [title, setTitle] = useState('Learning Session');

  useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  const currentSession = useMemo(
    () => learningSessions.find((session) => session.status === 'active' || session.status === 'paused') ?? null,
    [learningSessions],
  );

  const elapsedMinutes = currentSession
    ? Math.max(1, Math.round((Date.now() - new Date(currentSession.startedAt).getTime()) / 60000))
    : 0;

  const handleStart = () => {
    if (!selectedCategoryId || currentSession) return;
    startLearningSession(selectedCategoryId, title.trim() || 'Learning Session');
  };

  const handlePauseResume = () => {
    if (!currentSession) return;
    if (currentSession.status === 'active') {
      pauseLearningSession(currentSession.id);
      return;
    }
    resumeLearningSession(currentSession.id);
  };

  const handleClose = () => {
    if (!currentSession) return;
    updateTimeTracking(toDateKey(), currentSession.categoryId, elapsedMinutes);
    completeLearningSession(currentSession.id);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {!currentSession ? (
        <>
          <select
            value={selectedCategoryId}
            onChange={(event) => setSelectedCategoryId(event.target.value)}
            className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground"
            disabled={categories.length === 0}
          >
            {categories.length === 0 ? (
              <option value="">No category</option>
            ) : (
              categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))
            )}
          </select>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Session title"
            className="h-8 w-36 rounded-md border border-border bg-background px-2 text-xs text-foreground"
          />
          <button
            onClick={handleStart}
            disabled={categories.length === 0}
            className="h-8 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            title="Start learning"
          >
            <span className="inline-flex items-center gap-1">
              <Play className="h-3.5 w-3.5" /> Start Learning
            </span>
          </button>
        </>
      ) : (
        <>
          <div className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground inline-flex items-center gap-1.5">
            <Timer className="h-3.5 w-3.5" />
            <span>{currentSession.status === 'paused' ? 'Paused' : 'Learning'}</span>
            <span className="text-muted-foreground">· {elapsedMinutes}m</span>
          </div>
          <button
            onClick={handlePauseResume}
            className="h-8 rounded-md bg-secondary px-3 text-xs font-medium text-secondary-foreground"
            title={currentSession.status === 'active' ? 'Pause learning' : 'Resume learning'}
          >
            <span className="inline-flex items-center gap-1">
              {currentSession.status === 'active' ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {currentSession.status === 'active' ? 'Pause' : 'Resume'}
            </span>
          </button>
          <button
            onClick={handleClose}
            className="h-8 rounded-md bg-destructive/90 px-3 text-xs font-medium text-destructive-foreground"
            title="Close learning tracking"
          >
            <span className="inline-flex items-center gap-1">
              <Square className="h-3.5 w-3.5" /> Close
            </span>
          </button>
        </>
      )}
    </div>
  );
}

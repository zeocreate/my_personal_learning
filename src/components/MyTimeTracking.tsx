import { useMemo } from 'react';
import { Clock3 } from 'lucide-react';
import { useKnowledge } from '@/context/KnowledgeContext';

export function MyTimeTracking() {
  const { timeTracking, categories } = useKnowledge();

  const todayKey = new Date().toISOString().split('T')[0];
  const todayRows = timeTracking.filter((row) => row.date === todayKey);
  const todayMinutes = todayRows.reduce((sum, row) => sum + row.totalLearningMinutes, 0);
  const todaySessions = todayRows.reduce((sum, row) => sum + row.sessionsCount, 0);

  const recentRows = useMemo(() => {
    return [...timeTracking]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [timeTracking]);

  const getCategoryName = (id: string | null) => {
    if (!id) return 'General';
    return categories.find((category) => category.id === id)?.name ?? 'Unknown';
  };

  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Clock3 className="h-4 w-4 text-info" />
        <h2 className="text-sm font-semibold text-foreground">My Time Tracking (Ref)</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-background/70 border border-border p-3">
          <p className="text-xs text-muted-foreground">Today Minutes</p>
          <p className="text-xl font-semibold text-foreground">{todayMinutes}</p>
        </div>
        <div className="rounded-lg bg-background/70 border border-border p-3">
          <p className="text-xs text-muted-foreground">Today Sessions</p>
          <p className="text-xl font-semibold text-foreground">{todaySessions}</p>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2">Recent Tracking</p>
        {recentRows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tracking yet.</p>
        ) : (
          <div className="space-y-1.5">
            {recentRows.map((row) => (
              <div key={row.id} className="text-xs text-foreground flex items-center justify-between rounded-md bg-background/50 px-2 py-1.5 border border-border">
                <span>{row.date}</span>
                <span className="text-muted-foreground">{getCategoryName(row.categoryId)}</span>
                <span>{row.totalLearningMinutes}m</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

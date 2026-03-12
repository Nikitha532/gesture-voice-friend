import { Clock, Volume2 } from "lucide-react";

export interface HistoryEntry {
  id: string;
  gesture: string;
  timestamp: Date;
}

interface TranslationHistoryProps {
  entries: HistoryEntry[];
  onSpeak: (text: string) => void;
}

export function TranslationHistory({ entries, onSpeak }: TranslationHistoryProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2 text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-widest">Translation History</span>
      </div>
      {entries.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">No translations yet</p>
      ) : (
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-md bg-surface px-3 py-2 transition-colors hover:bg-surface-hover"
            >
              <div className="flex items-center gap-3">
                <span className="font-display text-sm font-semibold text-primary">{entry.gesture}</span>
                <span className="text-xs text-muted-foreground">
                  {entry.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <button
                onClick={() => onSpeak(entry.gesture)}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                aria-label={`Speak ${entry.gesture}`}
              >
                <Volume2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { BookOpen } from "lucide-react";
import { SUPPORTED_GESTURES } from "@/lib/gestureClassifier";

export function GestureGuide() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2 text-muted-foreground">
        <BookOpen className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-widest">Gesture Guide</span>
      </div>
      <div className="grid gap-1.5">
        {SUPPORTED_GESTURES.map((g) => (
          <div
            key={g.gesture}
            className="flex items-center justify-between rounded-md bg-surface px-3 py-1.5 text-sm"
          >
            <span className="font-display font-semibold text-primary">{g.gesture}</span>
            <span className="text-xs text-muted-foreground">{g.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

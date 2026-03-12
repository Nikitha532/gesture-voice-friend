import { Hand } from "lucide-react";

interface GestureDisplayProps {
  gesture: string | null;
  confidence: boolean;
}

export function GestureDisplay({ gesture, confidence }: GestureDisplayProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 text-center">
      <div className="mb-2 flex items-center justify-center gap-2 text-muted-foreground">
        <Hand className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-widest">Detected Gesture</span>
      </div>
      {gesture ? (
        <div className={`animate-slide-up ${confidence ? "animate-pulse-glow" : ""} rounded-lg bg-surface p-4`}>
          <p className="font-display text-4xl font-bold text-primary">{gesture}</p>
        </div>
      ) : (
        <div className="rounded-lg bg-surface p-4">
          <p className="font-display text-2xl text-muted-foreground">Waiting for gesture…</p>
        </div>
      )}
    </div>
  );
}

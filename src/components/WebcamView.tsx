import { forwardRef } from "react";
import { Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WebcamViewProps {
  isActive: boolean;
  error: string | null;
  onStart: () => void;
  onStop: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const WebcamView = forwardRef<HTMLVideoElement, WebcamViewProps>(
  ({ isActive, error, onStart, onStop, canvasRef }, ref) => {
    return (
      <div className="relative overflow-hidden rounded-lg border border-border bg-card">
        <div className="relative aspect-video w-full bg-muted">
          <video
            ref={ref}
            className="absolute inset-0 h-full w-full object-cover"
            playsInline
            muted
            style={{ transform: "scaleX(-1)" }}
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
          {!isActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="rounded-full bg-surface p-6">
                <Camera className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="font-display text-lg text-muted-foreground">
                Start camera to begin translating
              </p>
              {error && (
                <p className="max-w-sm text-center text-sm text-destructive">{error}</p>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-border bg-surface px-4 py-3">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isActive ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
            <span className="text-xs font-medium text-muted-foreground">
              {isActive ? "Camera Active" : "Camera Off"}
            </span>
          </div>
          <Button
            variant={isActive ? "destructive" : "default"}
            size="sm"
            onClick={isActive ? onStop : onStart}
            className="gap-2"
          >
            {isActive ? (
              <>
                <CameraOff className="h-4 w-4" /> Stop
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" /> Start Camera
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }
);

WebcamView.displayName = "WebcamView";

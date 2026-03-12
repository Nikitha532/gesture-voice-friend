import { useState, useCallback, useRef, useEffect } from "react";
import { FilesetResolver, HandLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";
import { useWebcam } from "@/hooks/useWebcam";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { classifyGesture, type HandLandmark } from "@/lib/gestureClassifier";
import { WebcamView } from "@/components/WebcamView";
import { GestureDisplay } from "@/components/GestureDisplay";
import { TranslationHistory, type HistoryEntry } from "@/components/TranslationHistory";
import { GestureGuide } from "@/components/GestureGuide";
import { Volume2, VolumeX, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { videoRef, isActive, error, start, stop } = useWebcam();
  const { speak, reset: resetSpeech } = useSpeechSynthesis();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const animFrameRef = useRef<number>(0);

  const [currentGesture, setCurrentGesture] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const gestureBufferRef = useRef<string[]>([]);
  const lastAddedRef = useRef<string>("");

  // Initialize MediaPipe
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      setIsLoading(true);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        if (cancelled) return;
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
        });
        if (cancelled) return;
        handLandmarkerRef.current = landmarker;
      } catch (err) {
        console.error("MediaPipe init error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
    return () => { cancelled = true; };
  }, []);

  // Detection loop
  const detect = useCallback(() => {
    const video = videoRef.current;
    const landmarker = handLandmarkerRef.current;
    const canvas = canvasRef.current;

    if (!video || !landmarker || !canvas || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    const result = landmarker.detectForVideo(video, performance.now());

    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (result.landmarks && result.landmarks.length > 0) {
        const drawingUtils = new DrawingUtils(ctx);
        for (const landmarks of result.landmarks) {
          drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
            color: "hsl(174, 72%, 46%)",
            lineWidth: 2,
          });
          drawingUtils.drawLandmarks(landmarks, {
            color: "hsl(174, 72%, 60%)",
            lineWidth: 1,
            radius: 3,
          });
        }
      }
    }

    if (result.landmarks && result.landmarks.length > 0) {
      const landmarks = result.landmarks[0] as HandLandmark[];
      const gesture = classifyGesture(landmarks);

      if (gesture) {
        gestureBufferRef.current.push(gesture);
        if (gestureBufferRef.current.length > 8) {
          gestureBufferRef.current.shift();
        }

        // Require consistent detection (majority in buffer)
        const counts: Record<string, number> = {};
        gestureBufferRef.current.forEach((g) => {
          counts[g] = (counts[g] || 0) + 1;
        });
        const maxEntry = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        if (maxEntry && maxEntry[1] >= 5) {
          const stableGesture = maxEntry[0];
          setCurrentGesture(stableGesture);

          if (stableGesture !== lastAddedRef.current) {
            lastAddedRef.current = stableGesture;
            setHistory((prev) => [
              { id: crypto.randomUUID(), gesture: stableGesture, timestamp: new Date() },
              ...prev.slice(0, 49),
            ]);
            if (speechEnabled) speak(stableGesture);
          }
        }
      } else {
        gestureBufferRef.current = [];
        setCurrentGesture(null);
      }
    } else {
      gestureBufferRef.current = [];
      setCurrentGesture(null);
    }

    animFrameRef.current = requestAnimationFrame(detect);
  }, [speechEnabled, speak, videoRef]);

  useEffect(() => {
    if (isActive) {
      animFrameRef.current = requestAnimationFrame(detect);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isActive, detect]);

  const handleStop = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    stop();
    setCurrentGesture(null);
    gestureBufferRef.current = [];
    lastAddedRef.current = "";
    resetSpeech();
  }, [stop, resetSpeech]);

  const handleSpeakHistory = useCallback(
    (text: string) => {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    },
    []
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Languages className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">SignLang AI</h1>
              <p className="text-xs text-muted-foreground">Real-Time Sign Language Translator</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className="gap-2"
          >
            {speechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="hidden sm:inline">{speechEnabled ? "Sound On" : "Sound Off"}</span>
          </Button>
        </div>
      </header>

      {/* Loading Banner */}
      {isLoading && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 text-center text-sm text-primary">
          Loading hand detection model…
        </div>
      )}

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Camera + Gesture */}
          <div className="space-y-4 lg:col-span-2">
            <WebcamView
              ref={videoRef}
              isActive={isActive}
              error={error}
              onStart={start}
              onStop={handleStop}
              canvasRef={canvasRef}
            />
            <GestureDisplay gesture={currentGesture} confidence={!!currentGesture} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <TranslationHistory entries={history} onSpeak={handleSpeakHistory} />
            <GestureGuide />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;

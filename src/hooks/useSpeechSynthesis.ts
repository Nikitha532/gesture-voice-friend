import { useCallback, useRef } from "react";

export function useSpeechSynthesis() {
  const lastSpoken = useRef<string>("");
  const cooldownRef = useRef(false);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis || cooldownRef.current) return;
    if (text === lastSpoken.current) return;

    lastSpoken.current = text;
    cooldownRef.current = true;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => {
      setTimeout(() => {
        cooldownRef.current = false;
      }, 1500);
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []);

  const reset = useCallback(() => {
    lastSpoken.current = "";
    cooldownRef.current = false;
    window.speechSynthesis?.cancel();
  }, []);

  return { speak, reset };
}

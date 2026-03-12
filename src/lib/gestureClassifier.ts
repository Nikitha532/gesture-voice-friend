// Rule-based gesture classifier using MediaPipe hand landmarks
// Landmark indices: https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

type FingerState = {
  thumb: boolean;
  index: boolean;
  middle: boolean;
  ring: boolean;
  pinky: boolean;
};

function getFingerStates(landmarks: HandLandmark[]): FingerState {
  // Thumb: compare tip (4) x to IP joint (3) x (for right hand, tip further from palm)
  const thumbExtended = Math.abs(landmarks[4].x - landmarks[2].x) > 0.05;
  
  // Other fingers: tip y < PIP joint y means extended (y goes down in screen coords)
  const indexExtended = landmarks[8].y < landmarks[6].y;
  const middleExtended = landmarks[12].y < landmarks[10].y;
  const ringExtended = landmarks[16].y < landmarks[14].y;
  const pinkyExtended = landmarks[20].y < landmarks[18].y;

  return {
    thumb: thumbExtended,
    index: indexExtended,
    middle: middleExtended,
    ring: ringExtended,
    pinky: pinkyExtended,
  };
}

function fingerCount(state: FingerState): number {
  return [state.thumb, state.index, state.middle, state.ring, state.pinky].filter(Boolean).length;
}

function indexThumbDistance(landmarks: HandLandmark[]): number {
  const dx = landmarks[4].x - landmarks[8].x;
  const dy = landmarks[4].y - landmarks[8].y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function classifyGesture(landmarks: HandLandmark[]): string | null {
  if (!landmarks || landmarks.length < 21) return null;

  const fingers = getFingerStates(landmarks);
  const count = fingerCount(fingers);
  const thumbIndexDist = indexThumbDistance(landmarks);

  // Fist (no fingers) = "Stop"
  if (count === 0) return "Stop";

  // All fingers open = "Hello" (open palm wave)
  if (count === 5) return "Hello";

  // Thumbs up (only thumb extended)
  if (fingers.thumb && !fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky) {
    return "Yes";
  }

  // Index only = "No" (pointing/wagging)
  if (!fingers.thumb && fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky) {
    return "No";
  }

  // Peace sign (index + middle) = "Thank You"
  if (!fingers.thumb && fingers.index && fingers.middle && !fingers.ring && !fingers.pinky) {
    return "Thank You";
  }

  // Index + middle + ring = "Please"
  if (!fingers.thumb && fingers.index && fingers.middle && fingers.ring && !fingers.pinky) {
    return "Please";
  }

  // Pinky only = "Help"
  if (!fingers.thumb && !fingers.index && !fingers.middle && !fingers.ring && fingers.pinky) {
    return "Help";
  }

  // Thumb + pinky (rock/shaka) = "Drink"
  if (fingers.thumb && !fingers.index && !fingers.middle && !fingers.ring && fingers.pinky) {
    return "Drink";
  }

  // OK gesture (thumb + index close, others extended) = "Eat"
  if (thumbIndexDist < 0.06 && fingers.middle && fingers.ring && fingers.pinky) {
    return "Eat";
  }

  // Index + pinky (horns) = "I Love You"
  if (!fingers.thumb && fingers.index && !fingers.middle && !fingers.ring && fingers.pinky) {
    return "I Love You";
  }

  // Four fingers (no thumb) = "Sorry"
  if (!fingers.thumb && fingers.index && fingers.middle && fingers.ring && fingers.pinky) {
    return "Sorry";
  }

  // Thumb + index = "Good"
  if (fingers.thumb && fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky) {
    return "Good";
  }

  return null;
}

export const SUPPORTED_GESTURES = [
  { gesture: "Hello", description: "Open palm (all fingers extended)" },
  { gesture: "Yes", description: "Thumbs up" },
  { gesture: "No", description: "Index finger only" },
  { gesture: "Thank You", description: "Peace sign (index + middle)" },
  { gesture: "Please", description: "Index + middle + ring fingers" },
  { gesture: "Help", description: "Pinky finger only" },
  { gesture: "Stop", description: "Closed fist" },
  { gesture: "Drink", description: "Thumb + pinky (shaka)" },
  { gesture: "Eat", description: "OK gesture (thumb-index pinch)" },
  { gesture: "I Love You", description: "Index + pinky (horns)" },
  { gesture: "Sorry", description: "Four fingers (no thumb)" },
  { gesture: "Good", description: "Thumb + index finger" },
];

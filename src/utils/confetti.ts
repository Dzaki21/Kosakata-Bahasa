import confetti from 'canvas-confetti';

export function fireCelebrationConfetti(): void {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0284c7', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
    });
  } catch (e) {
    // Graceful fallback if canvas is not supported
  }
}


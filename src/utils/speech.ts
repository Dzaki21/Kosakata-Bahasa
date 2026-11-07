/**
 * Plays German text pronunciation using browser's built-in Web Speech API.
 */
export function speakGerman(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';
  utterance.rate = 0.9; // Slightly slower for language learners

  // Try to pick a German voice if available
  const voices = window.speechSynthesis.getVoices();
  const germanVoice = voices.find(v => v.lang.startsWith('de'));
  if (germanVoice) {
    utterance.voice = germanVoice;
  }

  window.speechSynthesis.speak(utterance);
}


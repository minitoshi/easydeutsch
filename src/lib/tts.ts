function getGermanVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  // Prefer an online/enhanced voice, fall back to any de voice
  return (
    voices.find((v) => v.lang === 'de-DE' && !v.localService) ??
    voices.find((v) => v.lang.startsWith('de')) ??
    null
  );
}

function doSpeak(text: string) {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';
  utterance.rate = 0.85;
  const voice = getGermanVoice();
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

export function speakGerman(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  if (window.speechSynthesis.getVoices().length === 0) {
    // Voices not yet loaded — wait for them
    window.speechSynthesis.addEventListener('voiceschanged', () => doSpeak(text), { once: true });
  } else {
    doSpeak(text);
  }
}

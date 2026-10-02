/**
 * Voice Alert Service using Web Speech API + Web Audio API Chime
 * Provides hands-free audio announcements for Singapore drivers
 */

class VoiceAlertService {
  private synth: SpeechSynthesis | null = null;
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private voice: SpeechSynthesisVoice | null = null;
  private onSpeakingChangeCallbacks: ((speaking: boolean, text: string | null) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prefer crisp English voices (Samantha, Karen, Google UK/US, Natural)
    const preferredVoice = voices.find(
      (v) =>
        (v.lang.startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Karen') || v.name.includes('Natural') || v.name.includes('Siri'))) ||
        v.lang === 'en-SG' ||
        v.lang === 'en-GB' ||
        v.lang === 'en-US'
    );
    this.voice = preferredVoice || voices.find((v) => v.lang.startsWith('en')) || voices[0] || null;
  }

  private playChime(isUrgent: boolean = false) {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioCtx && AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (isUrgent) {
        // High attention dual beep (A5 to C6)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now); // A5
        osc.frequency.setValueAtTime(1046.5, now + 0.12); // C6
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else {
        // Gentle navigation chime (D5 to G5)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(783.99, now + 0.15); // G5
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch {
      // AudioContext could be blocked by autoplay policies until user gesture
    }
  }

  public subscribe(cb: (speaking: boolean, text: string | null) => void) {
    this.onSpeakingChangeCallbacks.push(cb);
    return () => {
      this.onSpeakingChangeCallbacks = this.onSpeakingChangeCallbacks.filter((c) => c !== cb);
    };
  }

  private notify(speaking: boolean, text: string | null) {
    this.onSpeakingChangeCallbacks.forEach((cb) => cb(speaking, text));
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.synth) {
      this.synth.cancel();
      this.notify(false, null);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.notify(false, null);
    }
  }

  public speak(text: string, isUrgent: boolean = false) {
    if (this.isMuted || !this.synth) {
      this.notify(false, text);
      return;
    }

    // Cancel current speech to prevent long lag queues in automotive environments
    this.synth.cancel();
    this.playChime(isUrgent);

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) {
      utterance.voice = this.voice;
    }
    utterance.rate = 1.05; // Slightly brisk for driver glanceability
    utterance.pitch = isUrgent ? 1.1 : 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      this.notify(true, text);
    };

    utterance.onend = () => {
      this.notify(false, null);
    };

    utterance.onerror = () => {
      this.notify(false, null);
    };

    // Small delay to allow chime sound to begin
    setTimeout(() => {
      if (this.synth) {
        this.synth.speak(utterance);
      }
    }, 120);
  }

  public speakTenMinuteAlert(carparkName: string, availableLots: number, isSheltered: boolean) {
    const shelterNotice = isSheltered ? 'Sheltered parking.' : 'Open air parking.';
    const message = `10 minutes to ${carparkName}. ${availableLots} lots currently available. ${shelterNotice} Backup routes monitored.`;
    this.speak(message, false);
  }

  public speakLowLotAlert(carparkName: string, availableLots: number, backupName?: string, backupLots?: number) {
    let message = `Alert! ${carparkName} has dropped to ${availableLots} lots remaining.`;
    if (backupName && backupLots !== undefined) {
      message += ` Backup option ${backupName} has ${backupLots} lots available. Tap to switch.`;
    }
    this.speak(message, true);
  }

  public speakBackupSwapped(newPrimaryName: string, availableLots: number) {
    const message = `Switched primary target to ${newPrimaryName}. ${availableLots} lots available. Recalculating entrance approach.`;
    this.speak(message, false);
  }

  public testVoice() {
    this.speak('ParkSG hands-free voice audio system online. Real-time lot alerts active.', false);
  }
}

export const voiceAlertService = new VoiceAlertService();

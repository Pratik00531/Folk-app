import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const CHANNEL_ID = 'folk_sadhana_reminders';
const CHANNEL_NAME = 'FOLK Sādhana Reminders';

/**
 * Initializes Android notification channel with high priority sound and vibration
 */
export async function initializeNotificationChannel(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.createChannel({
        id: CHANNEL_ID,
        name: CHANNEL_NAME,
        description: 'Instant reminders from your FOLK Guide for daily Sādhana reporting',
        importance: 5, // High / Heads-up notification
        visibility: 1, // Public
        sound: 'res_bell',
        vibration: true,
        lights: true,
        lightColor: '#DC6820',
      });
    } catch (e) {
      console.warn('Failed to create notification channel:', e);
    }
  }
}

/**
 * Checks current notification permission status across Native and Web
 */
export async function checkNotificationPermission(): Promise<'granted' | 'denied' | 'prompt'> {
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await LocalNotifications.checkPermissions();
      if (status.display === 'granted') return 'granted';
      if (status.display === 'denied') return 'denied';
      return 'prompt';
    } catch (e) {
      console.warn('Error checking Capacitor permissions:', e);
      return 'prompt';
    }
  }

  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    return 'prompt';
  }

  return 'denied';
}

/**
 * Prompts user for system-level notification permissions on App Start
 */
export async function requestNotificationPermission(): Promise<boolean> {
  // 1. Native Capacitor (Android)
  if (Capacitor.isNativePlatform()) {
    try {
      const result = await LocalNotifications.requestPermissions();
      if (result.display === 'granted') {
        await initializeNotificationChannel();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error requesting Capacitor local notification permission:', e);
      return false;
    }
  }

  // 2. Web Browser
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      const res = await Notification.requestPermission();
      return res === 'granted';
    } catch (e) {
      console.warn('Web notification permission error:', e);
      return false;
    }
  }

  return false;
}

/**
 * Plays a gentle temple chime using Web Audio API when notification is received
 */
export function playChimeSound() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Harmonic bell frequencies (root: 528Hz, overtone: 1056Hz)
    [528, 1056].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.25 / (i + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    });
  } catch (e) {
    // Ignore audio autoplay restrictions
  }
}

/**
 * Dispatches an immediate physical & system notification on the devotee's phone
 */
export async function sendDeviceNotification({
  title,
  body,
  id,
  deepLink = '/sadhana/today',
}: {
  title: string;
  body: string;
  id?: number;
  deepLink?: string;
}): Promise<void> {
  const notifId = id || Math.floor(Math.random() * 900000) + 100000;

  // 1. Trigger gentle audio chime & physical phone vibration
  playChimeSound();
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([200, 100, 200, 100, 300]);
    } catch (e) {
      // Vibrate not permitted without interaction
    }
  }

  // 2. Native Capacitor Android Notification
  if (Capacitor.isNativePlatform()) {
    try {
      await initializeNotificationChannel();
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notifId,
            title,
            body,
            channelId: CHANNEL_ID,
            schedule: { at: new Date(Date.now() + 100) }, // Immediate
            sound: 'res_bell',
            smallIcon: 'ic_launcher_round',
            largeIcon: 'ic_launcher',
            iconColor: '#DC6820',
            extra: {
              deep_link: deepLink,
            },
          },
        ],
      });
      return;
    } catch (e) {
      console.error('Failed to schedule Capacitor notification:', e);
    }
  }

  // 3. Web Notification API (Browser / PWA)
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: '/assets/images/Chanting.png',
          badge: '/assets/images/img.png',
          tag: `sadhana-reminder-${notifId}`,
          data: { deepLink },
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (e) {
        console.warn('Web Notification creation error:', e);
      }
    }
  }
}

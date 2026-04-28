import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestPermissions = async () => {
  if (!Device.isDevice) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  let final = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    final = status;
  }
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 100, 50, 100],
    });
  }
  return final === 'granted';
};

const TAGS = {
  daily: 'reminder-daily',
  breathing: 'reminder-breathing',
  weekly: 'reminder-weekly',
};

const cancelByTag = async (tag) => {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of all) {
    if (n.content?.data?.tag === tag) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
};

export const scheduleDailyReminder = async (enabled) => {
  await cancelByTag(TAGS.daily);
  if (!enabled) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'A gentle check-in',
      body: 'How are you feeling today? Just a moment of noticing.',
      data: { tag: TAGS.daily, screen: 'Mood' },
    },
    trigger: { hour: 20, minute: 0, repeats: true, channelId: 'reminders' },
  });
};

export const scheduleBreathingReminder = async (enabled) => {
  await cancelByTag(TAGS.breathing);
  if (!enabled) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time to breathe',
      body: 'Two minutes of breathing can shift everything. Try one round?',
      data: { tag: TAGS.breathing, screen: 'Breathing' },
    },
    trigger: { hour: 14, minute: 0, repeats: true, channelId: 'reminders' },
  });
};

export const scheduleWeeklyInsights = async (enabled) => {
  await cancelByTag(TAGS.weekly);
  if (!enabled) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Your week, gently reviewed',
      body: 'Tap to see your mood patterns and a small note from us.',
      data: { tag: TAGS.weekly, screen: 'Mood' },
    },
    // Sundays at 9:00 — weekday: 1 = Sunday on iOS, 1 = Sunday on Android too via expo
    trigger: { weekday: 1, hour: 9, minute: 0, repeats: true, channelId: 'reminders' },
  });
};

export const syncAllReminders = async ({ dailyReminders, breathingReminders, weeklyInsights }) => {
  await scheduleDailyReminder(dailyReminders);
  await scheduleBreathingReminder(breathingReminders);
  await scheduleWeeklyInsights(weeklyInsights);
};

export const cancelAll = async () => Notifications.cancelAllScheduledNotificationsAsync();
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@crimson_app_state';

export type StoredState = {
  partners: { id: string; name: string; color: string; pmsDays?: number; icon?: string }[];
  periodLogs: { id: string; partnerId: string; startDate: string; periodLengthDays: number; confirmedDays?: string[] }[];
  cycleEvents?: { id: string; partnerId: string; date: string; eventType: string; category: string; createdAt: number }[];
  appLockEnabled?: boolean;
  multiProfileEnabled?: boolean;
  themeMode?: string;
  onboardingComplete?: boolean;
};

export async function loadState(): Promise<StoredState | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredState;
  } catch {
    return null;
  }
}

export async function saveState(state: StoredState): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

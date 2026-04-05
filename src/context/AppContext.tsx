import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Partner, PeriodLog, CycleEvent, EventType, EventCategory } from '@/src/types';
import { parseDate, addDays, toDateOnly } from '@/src/utils/date';
import { loadState, saveState } from '@/src/services/storage';

export type ThemeMode = 'system' | 'light' | 'dark';

type AppState = {
  partners: Partner[];
  periodLogs: PeriodLog[];
  cycleEvents: CycleEvent[];
  activePartnerId: string | null;
  showPms: boolean;
  showFertility: boolean;
  showOvulation: boolean;
  appLockEnabled: boolean;
  multiProfileEnabled: boolean;
  themeMode: ThemeMode;
  onboardingComplete: boolean;
};

type Action =
  | { type: 'HYDRATE'; payload: Partial<AppState> }
  | { type: 'ADD_PARTNER'; payload: Partner }
  | { type: 'UPDATE_PARTNER'; payload: Partner }
  | { type: 'DELETE_PARTNER'; payload: string }
  | { type: 'SET_ACTIVE_PARTNER'; payload: string | null }
  | { type: 'ADD_PERIOD_LOG'; payload: PeriodLog }
  | { type: 'UPDATE_PERIOD_LOG'; payload: { id: string; startDate: string; periodLengthDays: number; confirmedDays: string[] } }
  | { type: 'REMOVE_PERIOD_LOG'; payload: string }
  | { type: 'TOGGLE_PMS' }
  | { type: 'TOGGLE_FERTILITY' }
  | { type: 'TOGGLE_OVULATION' }
  | { type: 'SET_APP_LOCK'; payload: boolean }
  | { type: 'SET_MULTI_PROFILE'; payload: boolean }
  | { type: 'SET_THEME_MODE'; payload: ThemeMode }
  | { type: 'SET_ONBOARDING_COMPLETE'; payload: boolean }
  | { type: 'ADD_CYCLE_EVENT'; payload: CycleEvent }
  | { type: 'REMOVE_CYCLE_EVENT'; payload: string }
  | { type: 'CLEAR_DAY_EVENTS'; payload: { partnerId: string; date: string } };

const MIN_CYCLE_GAP_DAYS = 21;
const DEFAULT_PERIOD_LENGTH = 5;
const BRIDGE_GAP = 2;
const MAX_PERIOD_DAYS = 10;

export type LogPeriodResult =
  | { ok: true }
  | { ok: false; reason: 'tooClose'; existingLogId: string }
  | { ok: false; reason: string };

function diffInDays(a: Date, b: Date): number {
  const ms = 1000 * 60 * 60 * 24;
  return Math.round((a.getTime() - b.getTime()) / ms);
}

function findBridgeCandidate(
  logs: PeriodLog[],
  partnerId: string,
  date: string,
): { log: PeriodLog; side: 'before' | 'after' } | null {
  const d = parseDate(date);
  const partnerLogs = logs.filter((l) => l.partnerId === partnerId);

  for (const log of partnerLogs) {
    const start = parseDate(log.startDate);
    const end = addDays(start, log.periodLengthDays - 1);

    if (d >= start && d <= end) return null;

    const gapAfter = diffInDays(d, end);
    if (gapAfter >= 1 && gapAfter <= BRIDGE_GAP) {
      const newLen = diffInDays(d, start) + 1;
      if (newLen <= MAX_PERIOD_DAYS) return { log, side: 'after' };
    }

    const gapBefore = diffInDays(start, d);
    if (gapBefore >= 1 && gapBefore <= BRIDGE_GAP) {
      const newLen = diffInDays(end, d) + 1;
      if (newLen <= MAX_PERIOD_DAYS) return { log, side: 'before' };
    }
  }
  return null;
}

function migrateLogs(logs: PeriodLog[]): PeriodLog[] {
  return logs.map((log) => {
    if (log.confirmedDays && log.confirmedDays.length > 0) return log;
    const start = parseDate(log.startDate);
    const confirmedDays = Array.from({ length: log.periodLengthDays }, (_, i) =>
      toDateOnly(addDays(start, i)),
    );
    return { ...log, confirmedDays };
  });
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return {
        ...state,
        ...action.payload,
        periodLogs: migrateLogs(action.payload.periodLogs ?? state.periodLogs),
      };
    case 'ADD_PARTNER':
      return {
        ...state,
        partners: [...state.partners, action.payload],
        activePartnerId: state.activePartnerId ?? action.payload.id,
      };
    case 'UPDATE_PARTNER':
      return {
        ...state,
        partners: state.partners.map((p) =>
          p.id === action.payload.id ? action.payload : p,
        ),
      };
    case 'DELETE_PARTNER':
      return {
        ...state,
        partners: state.partners.filter((p) => p.id !== action.payload),
        periodLogs: state.periodLogs.filter((l) => l.partnerId !== action.payload),
        cycleEvents: state.cycleEvents.filter((e) => e.partnerId !== action.payload),
        activePartnerId:
          state.activePartnerId === action.payload
            ? state.partners[0]?.id ?? null
            : state.activePartnerId,
      };
    case 'SET_ACTIVE_PARTNER':
      return { ...state, activePartnerId: action.payload };
    case 'ADD_PERIOD_LOG':
      return {
        ...state,
        periodLogs: [...state.periodLogs, action.payload],
      };
    case 'UPDATE_PERIOD_LOG':
      return {
        ...state,
        periodLogs: state.periodLogs.map((l) =>
          l.id === action.payload.id
            ? { ...l, startDate: action.payload.startDate, periodLengthDays: action.payload.periodLengthDays, confirmedDays: action.payload.confirmedDays }
            : l,
        ),
      };
    case 'REMOVE_PERIOD_LOG':
      return {
        ...state,
        periodLogs: state.periodLogs.filter((l) => l.id !== action.payload),
      };
    case 'TOGGLE_PMS':
      return { ...state, showPms: !state.showPms };
    case 'TOGGLE_FERTILITY':
      return { ...state, showFertility: !state.showFertility };
    case 'TOGGLE_OVULATION':
      return { ...state, showOvulation: !state.showOvulation };
    case 'SET_APP_LOCK':
      return { ...state, appLockEnabled: action.payload };
    case 'SET_MULTI_PROFILE':
      return { ...state, multiProfileEnabled: action.payload };
    case 'SET_THEME_MODE':
      return { ...state, themeMode: action.payload };
    case 'SET_ONBOARDING_COMPLETE':
      return { ...state, onboardingComplete: action.payload };
    case 'ADD_CYCLE_EVENT':
      return { ...state, cycleEvents: [...state.cycleEvents, action.payload] };
    case 'REMOVE_CYCLE_EVENT':
      return { ...state, cycleEvents: state.cycleEvents.filter((e) => e.id !== action.payload) };
    case 'CLEAR_DAY_EVENTS':
      return {
        ...state,
        cycleEvents: state.cycleEvents.filter(
          (e) => !(e.partnerId === action.payload.partnerId && e.date === action.payload.date),
        ),
      };
    default:
      return state;
  }
}

const initialState: AppState = {
  partners: [],
  periodLogs: [],
  cycleEvents: [],
  activePartnerId: null,
  showPms: true,
  showFertility: true,
  showOvulation: true,
  appLockEnabled: false,
  multiProfileEnabled: false,
  themeMode: 'dark' as ThemeMode,
  onboardingComplete: false,
};

type AppContextValue = AppState & {
  addPartner: (partner: Omit<Partner, 'id'>) => string;
  updatePartner: (partner: Partner) => void;
  deletePartner: (id: string) => void;
  setActivePartner: (id: string | null) => void;
  logPeriodStart: (partnerId: string, date: string) => LogPeriodResult;
  forceReplacePeriod: (partnerId: string, date: string, replaceLogId: string) => void;
  confirmDay: (logId: string, date: string) => void;
  removeDayFromPeriod: (logId: string, date: string) => void;
  removePeriodLog: (logId: string) => void;
  togglePms: () => void;
  toggleFertility: () => void;
  toggleOvulation: () => void;
  setAppLock: (enabled: boolean) => void;
  setMultiProfile: (enabled: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setOnboardingComplete: (complete: boolean) => void;
  addCycleEvent: (partnerId: string, date: string, eventType: EventType, category: EventCategory) => void;
  removeCycleEvent: (eventId: string) => void;
  toggleCycleEvent: (partnerId: string, date: string, eventType: EventType, category: EventCategory) => void;
  getEventsForDate: (partnerId: string, date: string) => CycleEvent[];
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    loadState().then((s) => {
      if (s) {
        dispatch({
          type: 'HYDRATE',
          payload: {
            partners: s.partners ?? [],
            periodLogs: s.periodLogs ?? [],
            cycleEvents: (s.cycleEvents ?? []) as CycleEvent[],
            activePartnerId: s.partners?.[0]?.id ?? null,
            appLockEnabled: s.appLockEnabled ?? false,
            multiProfileEnabled: s.multiProfileEnabled ?? false,
            themeMode: 'dark' as ThemeMode,
            onboardingComplete: s.onboardingComplete ?? false,
          },
        });
      }
    });
  }, []);

  useEffect(() => {
    if (state.partners.length > 0 || state.periodLogs.length > 0 || state.cycleEvents.length > 0 || state.appLockEnabled || state.multiProfileEnabled || state.onboardingComplete) {
      saveState({
        partners: state.partners,
        periodLogs: state.periodLogs,
        cycleEvents: state.cycleEvents,
        appLockEnabled: state.appLockEnabled,
        multiProfileEnabled: state.multiProfileEnabled,
        themeMode: state.themeMode,
        onboardingComplete: state.onboardingComplete,
      });
    }
  }, [state.partners, state.periodLogs, state.cycleEvents, state.appLockEnabled, state.multiProfileEnabled, state.themeMode, state.onboardingComplete]);

  const logPeriodStart = useCallback(
    (partnerId: string, date: string): LogPeriodResult => {
      const d = parseDate(date);
      const partnerLogs = state.periodLogs.filter((l) => l.partnerId === partnerId);

      for (const log of partnerLogs) {
        const start = parseDate(log.startDate);
        const end = addDays(start, log.periodLengthDays - 1);
        if (d >= start && d <= end) {
          return { ok: false, reason: 'This day is already part of a period.' };
        }
      }

      const bridge = findBridgeCandidate(state.periodLogs, partnerId, date);
      if (bridge) {
        const { log, side } = bridge;
        const logStart = parseDate(log.startDate);
        const logEnd = addDays(logStart, log.periodLengthDays - 1);

        if (side === 'after') {
          const newLength = diffInDays(d, logStart) + 1;
          dispatch({
            type: 'UPDATE_PERIOD_LOG',
            payload: {
              id: log.id,
              startDate: log.startDate,
              periodLengthDays: newLength,
              confirmedDays: [...(log.confirmedDays ?? []), date],
            },
          });
        } else {
          const newLength = diffInDays(logEnd, d) + 1;
          dispatch({
            type: 'UPDATE_PERIOD_LOG',
            payload: {
              id: log.id,
              startDate: date,
              periodLengthDays: newLength,
              confirmedDays: [...(log.confirmedDays ?? []), date],
            },
          });
        }
        return { ok: true };
      }

      for (const log of partnerLogs) {
        const existingStart = parseDate(log.startDate);
        const gap = Math.abs(diffInDays(d, existingStart));
        if (gap < MIN_CYCLE_GAP_DAYS) {
          return { ok: false, reason: 'tooClose', existingLogId: log.id };
        }
      }

      const id = `log-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      dispatch({
        type: 'ADD_PERIOD_LOG',
        payload: {
          id,
          partnerId,
          startDate: date,
          periodLengthDays: DEFAULT_PERIOD_LENGTH,
          confirmedDays: [date],
        },
      });
      return { ok: true };
    },
    [state.periodLogs],
  );

  const forceReplacePeriod = useCallback(
    (partnerId: string, date: string, replaceLogId: string) => {
      dispatch({ type: 'REMOVE_PERIOD_LOG', payload: replaceLogId });
      const id = `log-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      dispatch({
        type: 'ADD_PERIOD_LOG',
        payload: {
          id,
          partnerId,
          startDate: date,
          periodLengthDays: DEFAULT_PERIOD_LENGTH,
          confirmedDays: [date],
        },
      });
    },
    [],
  );

  const confirmDay = useCallback(
    (logId: string, date: string) => {
      const log = state.periodLogs.find((l) => l.id === logId);
      if (!log) return;
      if ((log.confirmedDays ?? []).includes(date)) return;
      dispatch({
        type: 'UPDATE_PERIOD_LOG',
        payload: {
          id: log.id,
          startDate: log.startDate,
          periodLengthDays: log.periodLengthDays,
          confirmedDays: [...(log.confirmedDays ?? []), date],
        },
      });
    },
    [state.periodLogs],
  );

  const removeDayFromPeriod = useCallback(
    (logId: string, date: string) => {
      const log = state.periodLogs.find((l) => l.id === logId);
      if (!log) return;

      if (log.periodLengthDays <= 1) {
        dispatch({ type: 'REMOVE_PERIOD_LOG', payload: logId });
        return;
      }

      const start = parseDate(log.startDate);

      if (date === log.startDate) {
        const newStart = toDateOnly(addDays(start, 1));
        const confirmedDays = (log.confirmedDays ?? []).filter((d) => d !== date);
        dispatch({
          type: 'UPDATE_PERIOD_LOG',
          payload: {
            id: log.id,
            startDate: newStart,
            periodLengthDays: log.periodLengthDays - 1,
            confirmedDays,
          },
        });
        return;
      }

      const target = parseDate(date);
      const newLength = diffInDays(target, start);
      if (newLength < 1) {
        dispatch({ type: 'REMOVE_PERIOD_LOG', payload: logId });
        return;
      }

      const newEnd = addDays(start, newLength - 1);
      const confirmedDays = (log.confirmedDays ?? []).filter((d) => {
        const dd = parseDate(d);
        return dd >= start && dd <= newEnd;
      });

      dispatch({
        type: 'UPDATE_PERIOD_LOG',
        payload: {
          id: log.id,
          startDate: log.startDate,
          periodLengthDays: newLength,
          confirmedDays,
        },
      });
    },
    [state.periodLogs],
  );

  const removePeriodLog = useCallback((logId: string) => {
    dispatch({ type: 'REMOVE_PERIOD_LOG', payload: logId });
  }, []);

  const addCycleEvent = useCallback(
    (partnerId: string, date: string, eventType: EventType, category: EventCategory) => {
      const id = `evt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      dispatch({
        type: 'ADD_CYCLE_EVENT',
        payload: { id, partnerId, date, eventType, category, createdAt: Date.now() },
      });
    },
    [],
  );

  const removeCycleEvent = useCallback((eventId: string) => {
    dispatch({ type: 'REMOVE_CYCLE_EVENT', payload: eventId });
  }, []);

  const toggleCycleEvent = useCallback(
    (partnerId: string, date: string, eventType: EventType, category: EventCategory) => {
      const existing = state.cycleEvents.find(
        (e) => e.partnerId === partnerId && e.date === date && e.eventType === eventType,
      );
      if (existing) {
        dispatch({ type: 'REMOVE_CYCLE_EVENT', payload: existing.id });
      } else {
        const id = `evt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        dispatch({
          type: 'ADD_CYCLE_EVENT',
          payload: { id, partnerId, date, eventType, category, createdAt: Date.now() },
        });
      }
    },
    [state.cycleEvents],
  );

  const getEventsForDate = useCallback(
    (partnerId: string, date: string) =>
      state.cycleEvents.filter((e) => e.partnerId === partnerId && e.date === date),
    [state.cycleEvents],
  );

  const value: AppContextValue = {
    ...state,
    addPartner: (p) => {
      const id = `p-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      dispatch({ type: 'ADD_PARTNER', payload: { ...p, id } });
      return id;
    },
    updatePartner: (p) => dispatch({ type: 'UPDATE_PARTNER', payload: p }),
    deletePartner: (id) => dispatch({ type: 'DELETE_PARTNER', payload: id }),
    setActivePartner: (id) => dispatch({ type: 'SET_ACTIVE_PARTNER', payload: id }),
    logPeriodStart,
    forceReplacePeriod,
    confirmDay,
    removeDayFromPeriod,
    removePeriodLog,
    togglePms: () => dispatch({ type: 'TOGGLE_PMS' }),
    toggleFertility: () => dispatch({ type: 'TOGGLE_FERTILITY' }),
    toggleOvulation: () => dispatch({ type: 'TOGGLE_OVULATION' }),
    setAppLock: (enabled: boolean) => dispatch({ type: 'SET_APP_LOCK', payload: enabled }),
    setMultiProfile: (enabled: boolean) => dispatch({ type: 'SET_MULTI_PROFILE', payload: enabled }),
    setThemeMode: (mode: ThemeMode) => dispatch({ type: 'SET_THEME_MODE', payload: mode }),
    setOnboardingComplete: (complete: boolean) => dispatch({ type: 'SET_ONBOARDING_COMPLETE', payload: complete }),
    addCycleEvent,
    removeCycleEvent,
    toggleCycleEvent,
    getEventsForDate,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

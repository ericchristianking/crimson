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
  | { type: 'UPDATE_PERIOD_LOG'; payload: { id: string; startDate: string; periodLengthDays: number } }
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

export type AddPeriodResult =
  | { ok: true }
  | { ok: true; extended: true }
  | { ok: false; reason: string }
  | { ok: false; reason: 'tooClose'; existingLogId: string };

function diffInDays(a: Date, b: Date): number {
  const ms = 1000 * 60 * 60 * 24;
  return Math.round((a.getTime() - b.getTime()) / ms);
}

const AUTO_FILL_GAP = 3;

function checkPeriod(
  logs: PeriodLog[],
  partnerId: string,
  startDate: string,
  days: number,
): AddPeriodResult {
  const newStart = parseDate(startDate);
  const newEnd = addDays(newStart, days - 1);
  const partnerLogs = logs.filter((l) => l.partnerId === partnerId);

  for (const log of partnerLogs) {
    const existingStart = parseDate(log.startDate);
    const existingEnd = addDays(existingStart, log.periodLengthDays - 1);

    if (newStart >= existingStart && newEnd <= existingEnd) {
      return { ok: false, reason: 'These days are already logged.' };
    }

    if (newStart <= existingEnd && newEnd >= existingStart) {
      return { ok: false, reason: 'This period overlaps with an existing period.' };
    }

    const gapAfter = diffInDays(newStart, existingEnd);
    if (gapAfter >= 1 && gapAfter <= AUTO_FILL_GAP) {
      return { ok: true, extended: true };
    }

    const gapBefore = diffInDays(existingStart, newEnd);
    if (gapBefore >= 1 && gapBefore <= AUTO_FILL_GAP) {
      return { ok: true, extended: true };
    }
  }

  for (const log of partnerLogs) {
    const existingStart = parseDate(log.startDate);
    const gap = Math.abs(diffInDays(newStart, existingStart));
    if (gap < MIN_CYCLE_GAP_DAYS) {
      return { ok: false, reason: 'tooClose', existingLogId: log.id };
    }
  }

  return { ok: true };
}

function findNearbyLog(
  logs: PeriodLog[],
  partnerId: string,
  startDate: string,
  days: number,
): { log: PeriodLog; side: 'before' | 'after'; gap: number } | null {
  const newStart = parseDate(startDate);
  const newEnd = addDays(newStart, days - 1);
  const partnerLogs = logs.filter((l) => l.partnerId === partnerId);

  for (const log of partnerLogs) {
    const existingStart = parseDate(log.startDate);
    const existingEnd = addDays(existingStart, log.periodLengthDays - 1);

    const gapAfter = diffInDays(newStart, existingEnd);
    if (gapAfter >= 1 && gapAfter <= AUTO_FILL_GAP) {
      return { log, side: 'after', gap: gapAfter };
    }

    const gapBefore = diffInDays(existingStart, newEnd);
    if (gapBefore >= 1 && gapBefore <= AUTO_FILL_GAP) {
      return { log, side: 'before', gap: gapBefore };
    }
  }
  return null;
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload };
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
            ? { ...l, startDate: action.payload.startDate, periodLengthDays: action.payload.periodLengthDays }
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
  addPeriodLog: (partnerId: string, startDate: string, days: number) => AddPeriodResult;
  forceAddPeriodLog: (partnerId: string, startDate: string, days: number, replaceLogId: string) => void;
  removePeriodLog: (logId: string) => void;
  updatePeriodLog: (logId: string, days: number) => void;
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

  const addPeriodLog = useCallback(
    (partnerId: string, startDate: string, days: number): AddPeriodResult => {
      const check = checkPeriod(state.periodLogs, partnerId, startDate, days);

      if (!check.ok) return check;

      if ('extended' in check && check.extended) {
        const nearby = findNearbyLog(state.periodLogs, partnerId, startDate, days);
        if (nearby) {
          const { log, side, gap } = nearby;
          const gapDays = gap - 1;
          if (side === 'after') {
            dispatch({
              type: 'UPDATE_PERIOD_LOG',
              payload: {
                id: log.id,
                startDate: log.startDate,
                periodLengthDays: log.periodLengthDays + gapDays + days,
              },
            });
          } else {
            dispatch({
              type: 'UPDATE_PERIOD_LOG',
              payload: {
                id: log.id,
                startDate,
                periodLengthDays: days + gapDays + log.periodLengthDays,
              },
            });
          }
          return { ok: true, extended: true };
        }
      }

      const id = `log-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      dispatch({
        type: 'ADD_PERIOD_LOG',
        payload: { id, partnerId, startDate, periodLengthDays: days },
      });
      return { ok: true };
    },
    [state.periodLogs],
  );

  const forceAddPeriodLog = useCallback(
    (partnerId: string, startDate: string, days: number, replaceLogId: string) => {
      dispatch({ type: 'REMOVE_PERIOD_LOG', payload: replaceLogId });
      const id = `log-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      dispatch({
        type: 'ADD_PERIOD_LOG',
        payload: { id, partnerId, startDate, periodLengthDays: days },
      });
    },
    [],
  );

  const removePeriodLog = useCallback((logId: string) => {
    dispatch({ type: 'REMOVE_PERIOD_LOG', payload: logId });
  }, []);

  const updatePeriodLog = useCallback(
    (logId: string, days: number) => {
      const log = state.periodLogs.find((l) => l.id === logId);
      if (!log) return;
      dispatch({
        type: 'UPDATE_PERIOD_LOG',
        payload: { id: logId, startDate: log.startDate, periodLengthDays: days },
      });
    },
    [state.periodLogs],
  );

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
    addPeriodLog,
    forceAddPeriodLog,
    removePeriodLog,
    updatePeriodLog,
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

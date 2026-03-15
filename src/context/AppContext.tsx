import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Partner, PeriodLog } from '@/src/types';
import { parseDate, addDays, toDateOnly } from '@/src/utils/date';
import { loadState, saveState } from '@/src/services/storage';

export type ThemeMode = 'system' | 'light' | 'dark';

type AppState = {
  partners: Partner[];
  periodLogs: PeriodLog[];
  activePartnerId: string | null;
  showPms: boolean;
  showFertility: boolean;
  showOvulation: boolean;
  pinCode: string | null;
  pinEnabled: boolean;
  themeMode: ThemeMode;
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
  | { type: 'SET_PIN'; payload: string }
  | { type: 'CLEAR_PIN' }
  | { type: 'SET_THEME_MODE'; payload: ThemeMode };

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
    if (gapAfter === 1) {
      return { ok: true, extended: true };
    }

    const gapBefore = diffInDays(existingStart, newEnd);
    if (gapBefore === 1) {
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

function findAdjacentLog(
  logs: PeriodLog[],
  partnerId: string,
  startDate: string,
  days: number,
): { log: PeriodLog; side: 'before' | 'after' } | null {
  const newStart = parseDate(startDate);
  const newEnd = addDays(newStart, days - 1);
  const partnerLogs = logs.filter((l) => l.partnerId === partnerId);

  for (const log of partnerLogs) {
    const existingStart = parseDate(log.startDate);
    const existingEnd = addDays(existingStart, log.periodLengthDays - 1);

    if (diffInDays(newStart, existingEnd) === 1) {
      return { log, side: 'after' };
    }
    if (diffInDays(existingStart, newEnd) === 1) {
      return { log, side: 'before' };
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
    case 'SET_PIN':
      return { ...state, pinCode: action.payload, pinEnabled: true };
    case 'CLEAR_PIN':
      return { ...state, pinCode: null, pinEnabled: false };
    case 'SET_THEME_MODE':
      return { ...state, themeMode: action.payload };
    default:
      return state;
  }
}

const initialState: AppState = {
  partners: [],
  periodLogs: [],
  activePartnerId: null,
  showPms: true,
  showFertility: true,
  showOvulation: true,
  pinCode: null,
  pinEnabled: false,
  themeMode: 'light' as ThemeMode,
};

type AppContextValue = AppState & {
  addPartner: (partner: Omit<Partner, 'id'>) => void;
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
  setPin: (pin: string) => void;
  clearPin: () => void;
  setThemeMode: (mode: ThemeMode) => void;
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
            activePartnerId: s.partners?.[0]?.id ?? null,
            pinCode: s.pinCode ?? null,
            pinEnabled: s.pinEnabled ?? false,
            themeMode: (s.themeMode as ThemeMode) ?? 'system',
          },
        });
      }
    });
  }, []);

  useEffect(() => {
    if (state.partners.length > 0 || state.periodLogs.length > 0 || state.pinEnabled || state.themeMode !== 'system') {
      saveState({
        partners: state.partners,
        periodLogs: state.periodLogs,
        pinCode: state.pinCode,
        pinEnabled: state.pinEnabled,
        themeMode: state.themeMode,
      });
    }
  }, [state.partners, state.periodLogs, state.pinCode, state.pinEnabled, state.themeMode]);

  const addPeriodLog = useCallback(
    (partnerId: string, startDate: string, days: number): AddPeriodResult => {
      const check = checkPeriod(state.periodLogs, partnerId, startDate, days);

      if (!check.ok) return check;

      if ('extended' in check && check.extended) {
        const adj = findAdjacentLog(state.periodLogs, partnerId, startDate, days);
        if (adj) {
          const { log, side } = adj;
          if (side === 'after') {
            dispatch({
              type: 'UPDATE_PERIOD_LOG',
              payload: {
                id: log.id,
                startDate: log.startDate,
                periodLengthDays: log.periodLengthDays + days,
              },
            });
          } else {
            dispatch({
              type: 'UPDATE_PERIOD_LOG',
              payload: {
                id: log.id,
                startDate,
                periodLengthDays: log.periodLengthDays + days,
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

  const value: AppContextValue = {
    ...state,
    addPartner: (p) =>
      dispatch({
        type: 'ADD_PARTNER',
        payload: { ...p, id: `p-${Date.now()}-${Math.random().toString(36).slice(2)}` },
      }),
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
    setPin: (pin: string) => dispatch({ type: 'SET_PIN', payload: pin }),
    clearPin: () => dispatch({ type: 'CLEAR_PIN' }),
    setThemeMode: (mode: ThemeMode) => dispatch({ type: 'SET_THEME_MODE', payload: mode }),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

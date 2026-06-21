import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useSystem } from '@ohif/core';
import type { DentalNumberingSystem } from '../data/teeth';
import { getDefaultTooth } from '../data/teeth';

export type DentalTheme = 'warm' | 'clinical';

export type DentalPreset = {
  id: string;
  label: string;
  toolName: string;
  unit: string;
};

export type DentalViewerState = {
  theme: DentalTheme;
  numberingSystem: DentalNumberingSystem;
  selectedTooth: string;
  activePreset: DentalPreset | null;
};

type DentalStateContextValue = {
  state: DentalViewerState;
  setTheme: (theme: DentalTheme) => void;
  setNumberingSystem: (numberingSystem: DentalNumberingSystem) => void;
  setSelectedTooth: (tooth: string) => void;
  setActivePreset: (preset: DentalPreset | null) => void;
};

const STORAGE_KEY = 'ohif-dental-viewer-state';
const BACKEND_URL = 'http://localhost:4010';// Todo: use environment variable

const defaultState: DentalViewerState = {
  theme: 'warm',
  numberingSystem: 'FDI',
  selectedTooth: getDefaultTooth('FDI'),
  activePreset: null,
};

const DentalStateContext = createContext<DentalStateContextValue | null>(null);

const themeVariables: Record<DentalTheme, Record<string, string>> = {
  warm: {
    '--background': '36 100% 97%',
    '--foreground': '215 33% 17%',
    '--primary': '21 79% 43%',
    '--primary-foreground': '0 0% 100%',
    '--secondary': '29 36% 92%',
    '--secondary-foreground': '215 33% 17%',
    '--accent': '38 94% 89%',
    '--accent-foreground': '215 33% 17%',
    '--muted': '32 32% 94%',
    '--muted-foreground': '215 14% 41%',
    '--border': '30 24% 82%',
    '--ring': '21 79% 43%',
    '--card': '0 0% 100%',
    '--popover': '0 0% 100%',
  },
  clinical: {
    '--background': '210 100% 98%',
    '--foreground': '217 33% 15%',
    '--primary': '197 92% 40%',
    '--primary-foreground': '0 0% 100%',
    '--secondary': '205 35% 93%',
    '--secondary-foreground': '217 33% 15%',
    '--accent': '188 75% 90%',
    '--accent-foreground': '217 33% 15%',
    '--muted': '205 27% 95%',
    '--muted-foreground': '215 14% 41%',
    '--border': '210 26% 82%',
    '--ring': '197 92% 40%',
    '--card': '0 0% 100%',
    '--popover': '0 0% 100%',
  },
};

function readStoredState() {
  if (typeof window === 'undefined') {
    return defaultState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultState;
    }

    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      selectedTooth: parsed.selectedTooth || defaultState.selectedTooth,
    };
  } catch {
    return defaultState;
  }
}

async function readBackendState(token?: string) {
  if (!BACKEND_URL || !token) {
    return null;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/state`, {
      headers: {
        Authorization: normalizeToken(token),
      },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

async function writeBackendState(state: DentalViewerState, token?: string) {
  if (!BACKEND_URL || !token) {
    return;
  }

  try {
    await fetch(`${BACKEND_URL}/api/state`, {
      method: 'PUT',
      headers: {
        Authorization: normalizeToken(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(state),
    });
  } catch {
    // Offline or unauthenticated persistence falls back to local storage.
  }
}

function applyTheme(theme: DentalTheme) {
  if (typeof document === 'undefined') {
    return;
  }

  const palette = themeVariables[theme];
  Object.entries(palette).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
  document.documentElement.dataset.dentalTheme = theme;
  document.body.style.fontFamily = 'Aptos, Segoe UI, sans-serif';
}
const TOKEN_STORAGE_KEY = 'ohif-dental-auth-token';

function normalizeToken(token?: string | null) {
  if (!token) return '';
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
}

async function loginToBackend() {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'dental', password: 'dental' }),
    });

    if (!response.ok) return '';

    const data = await response.json();
    const token = normalizeToken(data.token);

    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    return token;
  } catch (error) {
    console.warn('Dental backend login failed', error);
    return '';
  }
}

async function getBackendToken(userAuthenticationService?: any) {
  const ohifToken = userAuthenticationService?.getAuthorizationHeader?.()?.Authorization;
  if (ohifToken) return normalizeToken(ohifToken);

  const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  if (storedToken) return normalizeToken(storedToken);

  return loginToBackend();
}

export function DentalStateProvider({ children }: { children: React.ReactNode }) {
  const { servicesManager } = useSystem();
  const { userAuthenticationService } = servicesManager.services;
  const [state, setState] = useState<DentalViewerState>(() => readStoredState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
  let cancelled = false;

  async function hydrateDentalState() {
    const token = await getBackendToken(userAuthenticationService);
    const remoteState = await readBackendState(token);

    if (!cancelled && remoteState) {
      setState(currentState => ({
        ...currentState,
        ...remoteState,
        selectedTooth: remoteState.selectedTooth || currentState.selectedTooth,
      }));
    }

    if (!cancelled) {
      setHydrated(true);
    }
  }

  hydrateDentalState();

  return () => {
    cancelled = true;
  };
}, [userAuthenticationService]);

  useEffect(() => {
    applyTheme(state.theme);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    if (!hydrated) {
      return;
    }

    void getBackendToken(userAuthenticationService).then(token => {
        void writeBackendState(state, token);
    });
  }, [hydrated, state, userAuthenticationService]);

  const contextValue = useMemo<DentalStateContextValue>(
    () => ({
      state,
      setTheme: theme =>
        setState(currentState => ({
          ...currentState,
          theme,
        })),
      setNumberingSystem: numberingSystem =>
        setState(currentState => ({
          ...currentState,
          numberingSystem,
          selectedTooth: currentState.selectedTooth || getDefaultTooth(numberingSystem),
        })),
      setSelectedTooth: selectedTooth =>
        setState(currentState => ({
          ...currentState,
          selectedTooth,
        })),
      setActivePreset: activePreset =>
        setState(currentState => ({
          ...currentState,
          activePreset,
        })),
    }),
    [state]
  );

  return <DentalStateContext.Provider value={contextValue}>{children}</DentalStateContext.Provider>;
}

export function useDentalState() {
  const context = useContext(DentalStateContext);

  if (!context) {
    throw new Error('useDentalState must be used within DentalStateProvider');
  }

  return context;
}

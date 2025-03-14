import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Interface definiujący strukturę głównego store aplikacji
 */
interface AppState {
  // Stan dla ustawień użytkownika
  settings: {
    theme: 'light' | 'dark' | 'system';
    language: 'pl' | 'en';
  };
  
  // Stan dla analizy rozwodowej
  divorceAnalysis: {
    region: string;
    lastSearch: string | null;
    recentSearches: string[];
  };
  
  // Akcje dla ustawień
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: 'pl' | 'en') => void;
  
  // Akcje dla analizy
  setRegion: (region: string) => void;
  addRecentSearch: (search: string) => void;
  clearRecentSearches: () => void;
}

/**
 * Główny store aplikacji implementowany z użyciem Zustand
 * Używa middleware persist dla trwałego przechowywania w localStorage
 */
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Stan początkowy
      settings: {
        theme: 'system',
        language: 'pl',
      },
      
      divorceAnalysis: {
        region: '',
        lastSearch: null,
        recentSearches: [],
      },
      
      // Akcje dla ustawień
      setTheme: (theme) =>
        set((state) => ({
          settings: { ...state.settings, theme },
        })),
        
      setLanguage: (language) =>
        set((state) => ({
          settings: { ...state.settings, language },
        })),
      
      // Akcje dla analizy
      setRegion: (region) =>
        set((state) => ({
          divorceAnalysis: { ...state.divorceAnalysis, region },
        })),
        
      addRecentSearch: (search) =>
        set((state) => {
          // Usuwamy duplikaty i ograniczamy do 5 ostatnich wyszukiwań
          const filteredSearches = state.divorceAnalysis.recentSearches.filter(
            (s) => s !== search
          );
          
          return {
            divorceAnalysis: {
              ...state.divorceAnalysis,
              lastSearch: search,
              recentSearches: [search, ...filteredSearches].slice(0, 5),
            },
          };
        }),
        
      clearRecentSearches: () =>
        set((state) => ({
          divorceAnalysis: {
            ...state.divorceAnalysis,
            recentSearches: [],
          },
        })),
    }),
    {
      name: 'divorce-analysis-storage',
      partialize: (state) => ({
        settings: state.settings,
        divorceAnalysis: {
          region: state.divorceAnalysis.region,
          recentSearches: state.divorceAnalysis.recentSearches,
        },
      }),
    }
  )
);

/**
 * Hook selektor dla ustawień aplikacji
 */
export const useAppSettings = () => {
  return useAppStore((state) => state.settings);
};

/**
 * Hook selektor dla analizy rozwodowej
 */
export const useDivorceAnalysis = () => {
  return useAppStore((state) => state.divorceAnalysis);
};

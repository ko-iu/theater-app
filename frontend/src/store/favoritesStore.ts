import { create } from 'zustand';
import { api } from '../services/api';

interface FavoritePerformance {
  id: string;
  title: string;
  type: string;
  image_url?: string;
  imageUrl?: string;
  short_description?: string;
  shortDescription?: string;
}

interface FavoriteArtist {
  id: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role: string;
  image_url?: string;
  imageUrl?: string;
}

interface FavoritesState {
  performances: FavoritePerformance[];
  artists: FavoriteArtist[];
  isLoading: boolean;
  loadFavorites: () => Promise<void>;
  togglePerformance: (performanceId: string) => Promise<void>;
  toggleArtist: (artistId: string) => Promise<void>;
  isPerformanceFavorite: (performanceId: string) => boolean;
  isArtistFavorite: (artistId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  performances: [],
  artists: [],
  isLoading: false,

  loadFavorites: async () => {
    set({ isLoading: true });
    try {
      const [performances, artists] = await Promise.all([
        api.getFavoritePerformances(),
        api.getFavoriteArtists(),
      ]);
      set({ performances, artists, isLoading: false });
    } catch (error) {
      console.error('Failed to load favorites:', error);
      set({ isLoading: false });
    }
  },

  togglePerformance: async (performanceId: string) => {
    try {
      await api.toggleFavoritePerformance(performanceId);
      // Перезагружаем список избранного
      await get().loadFavorites();
    } catch (error) {
      console.error('Failed to toggle performance favorite:', error);
    }
  },

  toggleArtist: async (artistId: string) => {
    try {
      await api.toggleFavoriteArtist(artistId);
      // Перезагружаем список избранного
      await get().loadFavorites();
    } catch (error) {
      console.error('Failed to toggle artist favorite:', error);
    }
  },

  isPerformanceFavorite: (performanceId: string) => {
    return get().performances.some(p => p.id === performanceId);
  },

  isArtistFavorite: (artistId: string) => {
    return get().artists.some(a => a.id === artistId);
  },
}));
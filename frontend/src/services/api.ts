const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.132:5000/api';

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    console.log('Token:', token ? 'есть' : 'нет');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // ========== АУТЕНТИФИКАЦИЯ ==========
  async register(email: string, password: string, firstName: string, lastName: string, phone?: string) {
    const data = await this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName, phone }),
    });
    this.setToken(data.token);
    return data.user;
  }

  async login(email: string, password: string) {
    const data = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data.user;
  }

  async logout() {
    this.clearToken();
  }

  async getProfile() {
    return this.request<any>('/users/profile');
  }

 async updateProfile(firstName: string, lastName: string, phone?: string, email?: string) {
  return this.request('/users/profile', {
    method: 'PUT',
    body: JSON.stringify({ firstName, lastName, phone, email }),
  });
}

  // ========== СПЕКТАКЛИ ==========
  async getPerformances(filters?: { type?: string; search?: string; featured?: boolean }) {
    const params = new URLSearchParams();
    if (filters?.type && filters.type !== 'Все') params.append('type', filters.type);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.featured) params.append('featured', 'true');
    
    const query = params.toString();
    return this.request<any[]>(`/performances${query ? `?${query}` : ''}`);
  }

  async getPerformanceById(id: string) {
    return this.request<any>(`/performances/${id}`);
  }

  // ========== АРТИСТЫ ==========
  async getArtists(filters?: { category?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    
    const query = params.toString();
    return this.request<any[]>(`/artists${query ? `?${query}` : ''}`);
  }

  async getArtistById(id: string) {
    return this.request<any>(`/artists/${id}`);
  }

  // ========== СЛОВАРЬ ==========
  async getGlossaryTerms() {
    return this.request<any[]>('/glossary');
  }

  // ========== БАЛЕТ ==========
  async getBalletElements() {
    return this.request<any[]>('/ballet/elements');
  }

  // ========== ИЗБРАННОЕ ==========
  async getFavoritePerformances() {
    return this.request<any[]>('/users/favorites/performances');
  }

  async getFavoriteArtists() {
    return this.request<any[]>('/users/favorites/artists');
  }

  async toggleFavoritePerformance(performanceId: string) {
    return this.request(`/users/favorites/performance/${performanceId}`, {
      method: 'POST',
    });
  }

  async toggleFavoriteArtist(artistId: string) {
    return this.request(`/users/favorites/artist/${artistId}`, {
      method: 'POST',
    });
  }

  // ========== ИНТЕРАКТИВ ==========
  async getQuizQuestions() {
    return this.request<any[]>('/interactive/quiz');
  }

  async submitQuizResult(answers: string[], recommendedPerformanceId: string) {
    return this.request('/interactive/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({ answers, recommendedPerformanceId }),
    });
  }

  // ========== БИНГО ==========
  async getBingoState() {
    return this.request<{ 
      success: boolean; 
      hasSaved: boolean; 
      squares?: string[]; 
      completedSquares?: boolean[];
      isCompleted?: boolean;
      updatedAt?: string;
    }>('/interactive/bingo/state');
  }

  async saveBingoState(squares: string[], completedSquares: boolean[], isCompleted: boolean) {
    return this.request('/interactive/bingo/state', {
      method: 'POST',
      body: JSON.stringify({ squares, completedSquares, isCompleted }),
    });
  }

  async resetBingo() {
    return this.request<{ success: boolean; squares: string[]; completedSquares: boolean[] }>('/interactive/bingo/reset', {
      method: 'POST',
    });
  }

  async getBingoSquares() {
    return this.request<string[]>('/interactive/bingo/squares');
  }
  }

export const api = new ApiService();
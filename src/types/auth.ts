export interface AuthResponse {
  id: string
  email: string
  name: string
  token: string
  role: 'admin' | 'manager' | 'developer'
}

export interface AuthState {
  user: AuthResponse | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

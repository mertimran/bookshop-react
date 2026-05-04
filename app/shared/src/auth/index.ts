import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { createElement } from 'react'
import usersCsv from './users.csv?raw'

export type Role = 'admin' | 'customer'

export interface User {
  id: string
  email: string
  name: string
  role: Role
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  loginAsAdmin: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_KEY = 'bookshop_user'
const INVALID_CREDENTIALS = "These credentials don't match our records"

interface MockUser {
  email: string
  password: string
  name: string
  role: Role
}

const MOCK_USERS: MockUser[] = (() => {
  const lines = usersCsv.trim().split(/\r?\n/)
  const [header, ...rows] = lines
  const cols = header.split(',').map(c => c.trim())
  return rows.map(line => {
    const values = line.split(',').map(v => v.trim())
    const obj: any = {}
    cols.forEach((c, i) => { obj[c] = values[i] })
    return obj as MockUser
  })
})()

function findUser(email: string, password: string): MockUser | undefined {
  const e = email.trim().toLowerCase()
  return MOCK_USERS.find(u => u.email.toLowerCase() === e && u.password === password)
}

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Returns the Authorization header value for outgoing API calls, or null for
 * anonymous. In dev we map the SPA admin role to CAP's mocked `admin` user
 * (configured in package.json with role `admin`). Production deployments
 * front the API with the approuter, which injects xsuaa tokens itself.
 */
export function getAuthHeader(): string | null {
  const u = loadUser()
  if (u?.role === 'admin') return 'Basic ' + btoa('admin:admin')
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser)

  const login = useCallback(async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 500))
    const match = findUser(email, password)
    const u: User = match
      ? { id: crypto.randomUUID(), email: match.email, name: match.name, role: match.role }
      : { id: crypto.randomUUID(), email, name: email.split('@')[0], role: 'customer' }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    setUser(u)
  }, [])

  const loginAsAdmin = useCallback(async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 500))
    const match = findUser(email, password)
    if (!match || match.role !== 'admin') throw new Error(INVALID_CREDENTIALS)
    const u: User = { id: crypto.randomUUID(), email: match.email, name: match.name, role: match.role }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    setUser(u)
  }, [])

  const register = useCallback(async (name: string, email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 500))
    const u: User = { id: crypto.randomUUID(), email, name, role: 'customer' }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  return createElement(
    AuthContext.Provider,
    { value: { user, isAuthenticated: !!user, login, loginAsAdmin, register, logout } },
    children,
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

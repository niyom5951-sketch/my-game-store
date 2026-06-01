export type UserRole = "user" | "admin"

export type UserProfile = {
  id: string
  username: string
  email: string
  role: UserRole
  balance: number
  created_at?: string
}

export type ProductCategory = "topup" | "code" | "account"
export type GameInputType = "uid" | "uid_zone" | "username_password"

export type Game = {
  id: string
  name: string
  icon_url: string | null
  input_type: GameInputType
  sort_order: number
  is_active: boolean
}

export type Product = {
  id: string
  games_id: string | null
  name: string
  game_name: string | null
  category: ProductCategory
  input_type?: GameInputType | null
  price: number
  image_url: string | null
  description?: string | null
  stock_total: number
  stock_left: number
  is_active: boolean
}

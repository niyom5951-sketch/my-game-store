export type OrderStatus = "pending" | "success" | "failed" | "cancelled"

export type DepositMethod = "bank" | "phone_transfer" | "card" | "code"

export type DepositOrder = {
  id: string
  user_id: string
  method: DepositMethod
  amount_requested: number
  amount_received: number
  fee_percent: number
  status: OrderStatus
  created_at: string
}

export type TopupOrder = {
  id: string
  user_id: string
  product_id: string
  game_name: string
  price: number
  status: OrderStatus
  created_at: string
}

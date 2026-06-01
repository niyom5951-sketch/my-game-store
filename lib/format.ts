export function formatKip(value: number | null | undefined) {
  return `${(value ?? 0).toLocaleString()} ກີບ`
}

export function formatDate(value: string | Date) {
  return new Date(value).toLocaleString("lo-LA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

import BottomNav from "@/components/ui/BottomNav"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
      {children}
      <BottomNav />
    </div>
  )
}

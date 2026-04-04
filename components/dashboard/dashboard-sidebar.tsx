import Link from "next/link"

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/settings/shop", label: "Shop Settings" },
  { href: "/dashboard/settings/account", label: "Account Settings" },
]

export function DashboardSidebar() {
  return (
    <aside className="hidden border-r bg-white lg:block">
      <div className="p-6">
        <Link href="/dashboard" className="text-xl font-semibold">
          Sellora
        </Link>
      </div>

      <nav className="space-y-1 px-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-lg px-3 py-2 text-sm hover:bg-muted"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
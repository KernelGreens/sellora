export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p className="text-sm text-muted-foreground">
          Your store performance at a glance.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          "Total Orders",
          "Paid Orders",
          "Completed Orders",
          "Revenue This Month",
          "Repeat Customers",
        ].map((title) => (
          <div key={title} className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-3 text-2xl font-semibold">—</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="font-semibold">Recent Orders</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Orders will appear here once customers start buying.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="font-semibold">Top Products</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Your best-performing products will appear here.
          </p>
        </div>
      </section>
    </div>
  )
}
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const shop = await prisma.shop.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      products: {
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!shop) {
    redirect("/onboarding/shop");
  }

  if (shop.products.length === 0) {
    redirect("/onboarding/products");
  }

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
    </div>
  );
}
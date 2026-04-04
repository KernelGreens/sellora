import { ShoppingBag, BarChart3, Users, Store, CreditCard, Bell } from "lucide-react";

const features = [
  {
    icon: ShoppingBag,
    title: "Order Management",
    description: "Track every order from placement to delivery. Filter by status, payment, and date.",
  },
  {
    icon: Users,
    title: "Customer Directory",
    description: "Build a directory of all your customers with purchase history and contact details.",
  },
  {
    icon: Store,
    title: "Online Storefront",
    description: "Get a shareable product page your customers can browse and order from directly.",
  },
  {
    icon: CreditCard,
    title: "Payment Tracking",
    description: "Mark orders as paid, pending, or failed. Know who owes you at a glance.",
  },
  {
    icon: BarChart3,
    title: "Sales Analytics",
    description: "See revenue trends, top products, and repeat customer stats in one dashboard.",
  },
  {
    icon: Bell,
    title: "WhatsApp Shortcuts",
    description: "Quickly message customers about orders, updates, and follow-ups from the app.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20">
      <div className="container">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Everything you need to sell professionally
          </h2>
          <p className="text-muted-foreground text-lg">
            Simple, powerful tools designed for the way you already sell.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="group rounded-xl border bg-card p-6 transition-all hover:shadow-card-hover">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-secondary">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

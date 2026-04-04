import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link  from 'next/link';

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for getting started",
    features: ["Up to 50 orders/month", "1 shop", "Basic analytics", "WhatsApp shortcuts", "Online storefront"],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "₦5,000/mo",
    description: "For growing businesses",
    features: ["Unlimited orders", "Priority support", "Advanced analytics", "Custom storefront", "Customer exports", "Multiple payment tracking"],
    cta: "Get Started",
    highlighted: true,
  },
  {
    name: "Business",
    price: "₦15,000/mo",
    description: "For established sellers",
    features: ["Everything in Growth", "Multiple shops", "Team access", "API access", "Dedicated support", "Custom integrations"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 bg-surface">
      <div className="container">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Simple, honest pricing</h2>
          <p className="text-muted-foreground text-lg">
            Start free. Upgrade when you're ready.
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 ${
                plan.highlighted
                  ? "border-primary bg-card shadow-lg ring-1 ring-primary/20 relative"
                  : "bg-card shadow-card"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
                  Most Popular
                </div>
              )}
              <h3 className="mb-1 text-xl font-bold">{plan.name}</h3>
              <p className="mb-4 text-sm text-muted-foreground">{plan.description}</p>
              <p className="mb-6 text-3xl font-extrabold">{plan.price}</p>
              <ul className="mb-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.highlighted ? "default" : "outline"}
                asChild
              >
                <Link href="/signup">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

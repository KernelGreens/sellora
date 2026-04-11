import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Amara O.",
    role: "Fashion Seller, Lagos",
    quote: "I used to lose track of at least 5 orders every week. With KaraCarta, everything is organized and my customers trust me more.",
  },
  {
    name: "Chidinma E.",
    role: "Skincare Brand Owner",
    quote: "My customers can now browse my products and order directly. I've seen a 40% increase in repeat purchases.",
  },
  {
    name: "Tunde A.",
    role: "Electronics Seller, Abuja",
    quote: "The dashboard gives me a clear picture of my business. I finally know which products are really selling.",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20">
      <div className="container">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Sellers love KaraCarta
          </h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of small businesses already growing with KaraCarta.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-xl border bg-card p-6 shadow-card">
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">"{t.quote}"</p>
              <div>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

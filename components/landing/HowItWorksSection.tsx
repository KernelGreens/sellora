const steps = [
  {
    number: "01",
    title: "Create your shop",
    description: "Sign up and set up your shop profile in under 2 minutes.",
  },
  {
    number: "02",
    title: "Add your products",
    description: "Upload photos, set prices, and organize your catalog.",
  },
  {
    number: "03",
    title: "Share your storefront",
    description: "Send your unique link to customers on WhatsApp or Instagram.",
  },
  {
    number: "04",
    title: "Manage & grow",
    description: "Track orders, follow up with customers, and watch your sales grow.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 bg-surface">
      <div className="container">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Up and running in minutes
          </h2>
          <p className="text-muted-foreground text-lg">
            No technical skills needed. If you can use WhatsApp, you can use Sellora.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.number} className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-xl font-bold">
                {s.number}
              </div>
              <h3 className="mb-2 text-lg font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

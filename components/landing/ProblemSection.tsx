import { AlertTriangle, MessageSquare, FileX, Users } from "lucide-react";

const problems = [
  {
    icon: MessageSquare,
    title: "Scattered conversations",
    description: "Orders buried in WhatsApp chats that you can never find again.",
  },
  {
    icon: FileX,
    title: "No order tracking",
    description: "No way to know which orders are paid, shipped, or stuck.",
  },
  {
    icon: Users,
    title: "Forgotten customers",
    description: "Repeat buyers slip through the cracks because you have no records.",
  },
  {
    icon: AlertTriangle,
    title: "Lost revenue",
    description: "Missed follow-ups and delayed responses cost you real money.",
  },
];

const ProblemSection = () => {
  return (
    <section className="py-20 bg-surface">
      <div className="container">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Selling on social media is chaotic
          </h2>
          <p className="text-muted-foreground text-lg">
            You're juggling DMs, spreadsheets, and memory. It's not sustainable — and your customers notice.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((p) => (
            <div key={p.title} className="rounded-xl border bg-card p-6 shadow-card">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <p.icon className="h-5 w-5 text-destructive" />
              </div>
              <h3 className="mb-2 font-semibold">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;

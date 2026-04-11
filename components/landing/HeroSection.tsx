import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-background" />
      <div className="container relative">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm text-muted-foreground">
            <MessageCircle className="h-4 w-4 text-primary" />
            Built for WhatsApp & Instagram sellers
          </div>
          <h1 className="mb-6 text-4xl font-extrabold leading-tight md:text-6xl text-balance">
            Stop Losing Orders{" "}
            <span className="text-primary">in WhatsApp</span>
          </h1>
          <p className="mb-10 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto text-balance">
            KaraCarta helps small businesses manage orders, track customers, and grow sales — all from the channels you already use.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button variant="hero" size="xl" asChild>
              <Link href="/signup">
                Start Selling Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <Link href="#how-it-works">See How It Works</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Free forever for your first 50 orders. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

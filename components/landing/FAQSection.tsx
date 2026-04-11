import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is KaraCarta really free to start?",
    a: "Yes! The Starter plan is completely free and includes up to 50 orders per month. No credit card required.",
  },
  {
    q: "Do I need a website to use KaraCarta?",
    a: "No. KaraCarta gives you an online storefront automatically. Just share your unique link with customers on WhatsApp or Instagram.",
  },
  {
    q: "Can my customers pay through KaraCarta?",
    a: "KaraCarta helps you track payments, but transactions happen through your existing channels (bank transfer, mobile money, etc.).",
  },
  {
    q: "How is this different from a spreadsheet?",
    a: "KaraCarta gives you a real order management system with customer tracking, analytics, and a shareable storefront — things no spreadsheet can do.",
  },
  {
    q: "Can I use KaraCarta if I sell on Instagram?",
    a: "Absolutely. KaraCarta works with any social channel. Add your Instagram handle and share your storefront link in your bio.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. Your data is encrypted and stored securely. We never share your business data with third parties.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-20">
      <div className="container">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Frequently asked questions</h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about KaraCarta.
          </p>
        </div>
        <div className="mx-auto max-w-2xl">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border bg-card px-6 shadow-sm">
                <AccordionTrigger className="text-left font-medium hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;

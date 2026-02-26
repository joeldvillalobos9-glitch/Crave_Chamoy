import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "What is chamoy candy?", a: "Chamoy candy combines sweet, spicy, sour, and salty flavors. It's a Mexican-inspired treat made with chamoy sauce (a condiment made from pickled fruit) and chili lime seasoning." },
  { q: "How spicy is CraveChamoy candy?", a: "Our candy has a mild-to-medium spice level. It's more of a warm, tangy kick than intense heat — perfect for anyone who loves a little adventure in their candy!" },
  { q: "Do you offer free shipping?", a: "We offer free shipping on orders over $35 within the US. Standard shipping is available for $4.99 on all other orders." },
  { q: "How does the Chamoy Points program work?", a: "Earn 10 Chamoy Points for every $1 you spend. Once you reach 100 points, you can redeem them for $1 off your next order. Points accumulate over time!" },
  { q: "Can I use my referral reward with other discounts?", a: "Discount stacking rules are managed by our team. By default, referral rewards can be used alongside your Chamoy Points balance. Check the rewards page for current rules." },
  { q: "What are your most popular products?", a: "Our Classic Chamoy Candy and Mango Chamoy Lollipops are fan favorites! The Chamoy Gummy Bears are also super popular for sharing." },
];

const HomeFAQ = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-sm font-body font-semibold text-primary uppercase tracking-wider">Got Questions?</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-2">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="bg-card rounded-xl border border-border px-6 shadow-card">
              <AccordionTrigger className="text-left font-display font-semibold text-foreground hover:text-primary py-4">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground font-body pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default HomeFAQ;

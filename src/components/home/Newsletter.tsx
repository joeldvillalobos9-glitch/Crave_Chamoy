import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("You're on the list! 🌶️ Check your inbox for a sweet welcome.");
      setEmail("");
    }
  };

  return (
    <section className="py-16 md:py-24 gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-6 right-10 text-6xl">🍬</div>
        <div className="absolute bottom-8 left-16 text-5xl">🌶️</div>
        <div className="absolute top-1/3 right-1/4 text-3xl">✨</div>
      </div>
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto text-center"
        >
          <span className="text-4xl block mb-4">📧</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-3">
            Stay in the Loop
          </h2>
          <p className="text-primary-foreground/80 font-body mb-8">
            Get early access to new flavors, exclusive deals, and chamoy content. No spam, just candy. 🍬
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 h-12 px-5 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground font-body placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30"
              required
            />
            <Button variant="candy" size="lg" type="submit" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-candy">
              Subscribe 🌶️
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;

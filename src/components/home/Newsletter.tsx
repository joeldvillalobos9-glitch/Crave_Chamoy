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
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto text-center"
        >
          <span className="text-4xl block mb-4">📧</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
            Stay in the Loop
          </h2>
          <p className="text-muted-foreground font-body mb-8">
            Get early access to new flavors, exclusive deals, and chamoy content. No spam, just candy. 🍬
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 h-12 px-5 rounded-xl bg-muted border border-border text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <Button variant="hero" size="lg" type="submit">
              Subscribe 🌶️
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;

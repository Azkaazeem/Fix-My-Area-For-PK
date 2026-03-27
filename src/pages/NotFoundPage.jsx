import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPinned, ArrowLeft } from "lucide-react";

export const NotFoundPage = () => {
  return (
    <section className="section-shell flex min-h-[75vh] items-center justify-center py-20 text-center relative">
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-panel relative mx-auto flex max-w-lg flex-col items-center overflow-hidden rounded-[34px] border border-border/15 p-12 shadow-2xl"
      >
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-[70px]"></div>
        <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-accent/20 blur-[70px]"></div>
        
        <motion.div 
          initial={{ rotate: -10, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-[28px] border border-primary/25 bg-primary/15 shadow-glow"
        >
          <MapPinned className="h-10 w-10 text-primary" />
        </motion.div>
        
        <h1 className="font-display mb-2 text-7xl font-bold tracking-tight text-text">
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">404</span>
        </h1>
        <h2 className="font-display mb-4 text-2xl font-semibold text-text">
          Lost in the city?
        </h2>
        <p className="mb-8 p-1 text-sm leading-relaxed text-muted sm:text-base">
          Oops! It seems the area you are looking for has been misplaced or doesn't exist in our civic records. Don't worry, let's get you back on track.
        </p>
        
        <Link 
          to="/" 
          className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border border-primary/20 bg-primary px-8 py-3.5 font-semibold text-white shadow-glow transition hover:scale-[1.02] hover:bg-primary/90 active:scale-[0.98]"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          <span>Return Home</span>
        </Link>
      </motion.div>
    </section>
  );
};

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const useGsapReveal = () => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { autoAlpha: 0, y: 56, scale: 0.97 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 84%",
            once: true
          }
        }
      );
    }, ref);

    return () => ctx.revert();
  }, []);

  return ref;
};

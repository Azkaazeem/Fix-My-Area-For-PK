import { useEffect, useRef } from "react";
import gsap from "gsap";

export const useTiltHover = () => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const onMove = (event) => {
      const bounds = element.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const rotateX = ((y / bounds.height) - 0.5) * -12;
      const rotateY = ((x / bounds.width) - 0.5) * 14;

      gsap.to(element, {
        rotateX,
        rotateY,
        y: -10,
        transformPerspective: 1100,
        transformOrigin: "center",
        duration: 0.35,
        ease: "power2.out"
      });
    };

    const onLeave = () => {
      gsap.to(element, {
        rotateX: 0,
        rotateY: 0,
        y: 0,
        duration: 0.55,
        ease: "power3.out"
      });
    };

    element.addEventListener("mousemove", onMove);
    element.addEventListener("mouseleave", onLeave);

    return () => {
      element.removeEventListener("mousemove", onMove);
      element.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return ref;
};

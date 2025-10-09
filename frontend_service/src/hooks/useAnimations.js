import { useEffect } from "react";
import anime from "animejs";

export const useSlideIn = (trigger, direction = "up", delay = 0) => {
  useEffect(() => {
    if (trigger) {
      const translateProperty =
        direction === "up"
          ? "translateY"
          : direction === "down"
          ? "translateY"
          : direction === "left"
          ? "translateX"
          : "translateX";

      const fromValue =
        direction === "up"
          ? 100
          : direction === "down"
          ? -100
          : direction === "left"
          ? 100
          : -100;

      anime({
        targets: ".animate-slide-in",
        [translateProperty]: [fromValue, 0],
        opacity: [0, 1],
        duration: 800,
        delay: delay,
        easing: "easeOutCubic",
      });
    }
  }, [trigger, direction, delay]);
};

export const useFadeIn = (trigger, delay = 0) => {
  useEffect(() => {
    if (trigger) {
      anime({
        targets: ".animate-fade-in",
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 600,
        delay: delay,
        easing: "easeOutQuart",
      });
    }
  }, [trigger, delay]);
};

export const useStaggeredFadeIn = (trigger, staggerDelay = 100) => {
  useEffect(() => {
    if (trigger) {
      anime({
        targets: ".animate-stagger",
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        delay: anime.stagger(staggerDelay),
        easing: "easeOutQuart",
      });
    }
  }, [trigger, staggerDelay]);
};

export const usePulse = (trigger) => {
  useEffect(() => {
    if (trigger) {
      anime({
        targets: ".animate-pulse",
        scale: [1, 1.05, 1],
        duration: 1000,
        easing: "easeInOutQuart",
        loop: true,
      });
    }
  }, [trigger]);
};

"use client";

import JSConfetti from "js-confetti";
import { useLayoutEffect } from "react";

export const Confetti = () => {
  useLayoutEffect(() => {
    const jsConfetti = new JSConfetti();

    jsConfetti
      .addConfetti({
        confettiColors: [
          "#ff0a54",
          "#ff477e",
          "#ff7096",
          "#ff85a1",
          "#fbb1bd",
          "#f9bec7",
        ],
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  return null;
};

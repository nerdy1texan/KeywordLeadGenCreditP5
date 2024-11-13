"use client";
import { type ReactNode, useEffect, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

export default function AnimatedCheckbox({
  children,
  onClick,
  className,
  onLoad,
}: {
  children?: ReactNode;
  onClick?: () => Promise<void>;
  className?: string;
  onLoad?: boolean;
}) {
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    if (onLoad) {
      setIsClicked(true);
    }
  }, []);
  const clipboardVariants = {
    clicked: { opacity: 0, transition: { delay: 0, duration: 0.3 } },
    unclicked: { opacity: 1 },
  };

  const circleVariants = {
    clicked: {
      opacity: 1,
      pathLength: 1,
      transition: { delay: 0.3, duration: 0.5 },
    },
    unclicked: { opacity: 0, pathLength: 0 },
  };

  const checkmarkVariants = {
    clicked: {
      opacity: 1,
      pathLength: 1,
      transition: { delay: 0.8, duration: 0.5 },
    },
    unclicked: { opacity: 0, pathLength: 0 },
  };

  const pathLength = useMotionValue(0);
  const opacity = useTransform(pathLength, [0, 0.5], [0, 1]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      onClick={async () => {
        setIsClicked(true);
        setTimeout(() => setIsClicked(false), 5000);
        onClick && (await onClick());
      }}
      viewBox="0 0 128 128"
    >
      <g fill="none" fillRule="evenodd">
        <motion.g
          initial={false}
          animate={isClicked ? "clicked" : "unclicked"}
          variants={clipboardVariants}
        >
          {children}
        </motion.g>
        <g transform="translate(5 5)" stroke="#63D76B">
          <motion.path
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5, 59 a 54,54 0 1,0 108,0 a 54,54 0 1,0 -108,0"
            initial={false}
            animate={isClicked ? "clicked" : "unclicked"}
            variants={circleVariants}
          />
          <motion.path
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M29.748 66.707l14.6436 14.6436 40.3838-40.3838"
            initial={false}
            animate={isClicked ? "clicked" : "unclicked"}
            variants={checkmarkVariants}
            style={{ pathLength, opacity }}
          />
        </g>
      </g>
    </svg>
  );
}

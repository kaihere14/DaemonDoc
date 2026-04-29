"use client";
import * as React from "react";
import { motion } from "motion/react";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
} from "@/components/animate-ui/icons/icon";

const animations = {
  default: {
    path1: {},
    path2: {},
    path3: {},
    path4: {},

    path5: {
      initial: {
        opacity: 1,
        scale: 1,
      },
      animate: {
        opacity: [1, 0.5, 1, 0.5, 1],
        scale: [1, 0.9, 1, 0.9, 1],
        transition: {
          duration: 1.8,
          ease: "easeInOut",
        },
      },
    },
  },
};

function IconComponent({ size, ...props }) {
  const { controls } = useAnimateIconContext();
  const variants = getVariants(animations);

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <motion.path
        d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m2 22 3-3"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M7.5 13.5 10 11"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M10.5 16.5 13 14"
        variants={variants.path4}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m18 3-4 4h6l-4 4"
        variants={variants.path5}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function PlugZap(props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export { animations, PlugZap, PlugZap as PlugZapIcon };

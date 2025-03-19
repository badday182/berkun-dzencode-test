"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface AnimatedLayoutProps {
  children: ReactNode;
}

const pageVariants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
};

const AnimatedLayout = ({ children }: AnimatedLayoutProps) => {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={pageVariants}
        className="w-100"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimatedLayout;

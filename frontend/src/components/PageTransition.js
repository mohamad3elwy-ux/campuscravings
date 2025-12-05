import React from 'react';
import { motion } from 'framer-motion';

const PageTransition = ({ children, direction }) => {
  // Determine slide direction based on page
  const getSlideVariants = (direction) => {
    switch(direction) {
      case 'left':
        return {
          initial: { opacity: 0, x: 50 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -50 }
        };
      case 'right':
        return {
          initial: { opacity: 0, x: -50 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 50 }
        };
      case 'up':
        return {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -30 }
        };
      default: // 'down' or fallback
        return {
          initial: { opacity: 0, y: -30 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 30 }
        };
    }
  };

  const variants = getSlideVariants(direction);

  return (
    <motion.div
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      transition={{
        duration: 0.2,
        ease: "easeInOut"
      }}
      className="min-h-full"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;

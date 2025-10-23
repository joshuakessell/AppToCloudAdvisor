// Animation utilities for Framer Motion
// Provides consistent, professional animations across the app

import { Variants, Transition } from "framer-motion";

// ============================================================================
// TRANSITION PRESETS
// ============================================================================

export const transitions = {
  // Smooth spring for natural movement
  spring: {
    type: "spring",
    stiffness: 300,
    damping: 30,
  } as Transition,

  // Gentle spring for larger elements
  gentleSpring: {
    type: "spring",
    stiffness: 200,
    damping: 25,
  } as Transition,

  // Smooth tween for predictable timing
  smooth: {
    type: "tween",
    duration: 0.3,
    ease: [0.4, 0.0, 0.2, 1], // Material Design easing
  } as Transition,

  // Slower smooth transition for page changes
  smoothSlow: {
    type: "tween",
    duration: 0.5,
    ease: [0.4, 0.0, 0.2, 1],
  } as Transition,

  // Quick for small interactions
  quick: {
    type: "tween",
    duration: 0.2,
    ease: [0.4, 0.0, 0.2, 1],
  } as Transition,
};

// ============================================================================
// COMMON ANIMATION VARIANTS
// ============================================================================

// Fade in from transparent
export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    transition: transitions.quick,
  },
};

// Fade in with slight upward movement
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.gentleSpring,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: transitions.quick,
  },
};

// Slide in from right (for page transitions)
export const slideInFromRight: Variants = {
  hidden: {
    opacity: 0,
    x: 50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.smoothSlow,
  },
  exit: {
    opacity: 0,
    x: -50,
    transition: transitions.smooth,
  },
};

// Slide in from left (for back navigation)
export const slideInFromLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.smoothSlow,
  },
  exit: {
    opacity: 0,
    x: 50,
    transition: transitions.smooth,
  },
};

// Scale up entrance (for modals, cards)
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.gentleSpring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: transitions.quick,
  },
};

// ============================================================================
// STAGGER ANIMATIONS (for lists and groups)
// ============================================================================

// Container that staggers children
export const staggerContainer: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// Fast stagger for dense lists
export const staggerContainerFast: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

// Stagger item (child of staggerContainer)
export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.spring,
  },
};

// ============================================================================
// ACCORDION/COLLAPSE ANIMATIONS
// ============================================================================

export const accordionContent: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: transitions.smooth,
  },
  expanded: {
    height: "auto",
    opacity: 1,
    transition: transitions.gentleSpring,
  },
};

// ============================================================================
// TAB ANIMATIONS
// ============================================================================

export const tabContent: Variants = {
  hidden: {
    opacity: 0,
    x: -10,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    x: 10,
    transition: transitions.quick,
  },
};

// ============================================================================
// CARD/SECTION ANIMATIONS
// ============================================================================

export const cardEntrance: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.gentleSpring,
  },
};

// ============================================================================
// BUTTON/INTERACTIVE ANIMATIONS
// ============================================================================

export const buttonHover = {
  scale: 1.02,
  transition: transitions.quick,
};

export const buttonTap = {
  scale: 0.98,
  transition: transitions.quick,
};

// ============================================================================
// LOADING ANIMATIONS
// ============================================================================

export const pulse: Variants = {
  initial: {
    opacity: 0.6,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
    },
  },
};

export const spin: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

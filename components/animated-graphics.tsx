'use client';

import { motion } from 'framer-motion';

export function AnimatedGraphics() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated orb 1 */}
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 bg-[#2E8C96] rounded-full blur-3xl opacity-20"
        animate={{
          y: [0, 30, 0],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Animated orb 2 */}
      <motion.div
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#2A7A84] rounded-full blur-3xl opacity-15"
        animate={{
          y: [0, -40, 0],
          x: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />

      {/* Animated orb 3 */}
      <motion.div
        className="absolute top-1/3 right-1/4 w-60 h-60 bg-[#2E8C96] rounded-full blur-3xl opacity-10"
        animate={{
          y: [0, -20, 0],
          x: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      {/* Grid lines effect */}
      <svg
        className="absolute inset-0 w-full h-full opacity-5"
        width="100%"
        height="100%"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#2E8C96"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Floating particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-[#2E8C96] rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
}

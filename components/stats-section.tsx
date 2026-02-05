'use client';

import { motion } from 'framer-motion';

const achievements = [
  {
    badge: '🎪',
    number: '50K+',
    label: 'Events Hosted',
    description: 'Legendary experiences worldwide',
    delay: 0.1,
  },
  {
    badge: '⭐',
    number: '2M+',
    label: 'Players United',
    description: 'Gaming the experience',
    delay: 0.2,
  },
  {
    badge: '💎',
    number: '$100M+',
    label: 'Treasure Unlocked',
    description: 'Wealth generated',
    delay: 0.3,
  },
  {
    badge: '🌍',
    number: '180+',
    label: 'Worlds Connected',
    description: 'Global conquest',
    delay: 0.4,
  },
];

export function StatsSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section className="w-full py-24 bg-gradient-to-br from-white via-[#F8FAFB] to-[#E9F1F4] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#2E8C96]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#2A7A84]/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center max-w-2xl mx-auto"
        >
          <span className="inline-block px-4 py-2 mb-4 text-xs font-bold tracking-widest text-[#2E8C96] bg-[#2E8C96]/10 rounded-full border border-[#2E8C96]/20">
            COMMUNITY MILESTONES
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#1F2D3A] mt-3">
            Legendary Community Stats
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -10 }}
              className="group"
            >
              <div className="relative h-full p-8 rounded-2xl bg-gradient-to-br from-white to-[#F8FAFB] border-2 border-[#E9F1F4] transition-all duration-300 hover:shadow-2xl hover:border-[#2E8C96] hover:bg-gradient-to-br hover:from-white hover:to-[#F8FAFB]">
                {/* Glowing top accent */}
                <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-[#2E8C96]/10 rounded-full blur-2xl group-hover:bg-[#2E8C96]/20 transition-colors" />

                {/* Achievement Badge */}
                <div className="relative mb-6 inline-block">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-5xl"
                  >
                    {achievement.badge}
                  </motion.div>
                </div>

                {/* Number with animation */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: achievement.delay, duration: 0.6 }}
                  className="mb-2"
                >
                  <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#2E8C96] to-[#2A7A84] bg-clip-text text-transparent">
                    {achievement.number}
                  </div>
                </motion.div>

                {/* Label */}
                <h3 className="text-lg font-bold text-[#1F2D3A] mb-2">
                  {achievement.label}
                </h3>

                {/* Description */}
                <p className="text-sm text-[#4A5568] mb-4">
                  {achievement.description}
                </p>

                {/* Unlock bar */}
                <div className="relative h-2 bg-[#E9F1F4] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#2E8C96] to-[#2A7A84]"
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ delay: achievement.delay + 0.2, duration: 1 }}
                  />
                </div>

                {/* Unlocked badge on hover */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-4 right-4 px-3 py-1 bg-[#2E8C96] text-white text-xs font-bold rounded-full hidden group-hover:block"
                >
                  UNLOCKED
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

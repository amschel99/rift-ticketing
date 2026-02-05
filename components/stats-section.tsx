'use client';

import { motion } from 'framer-motion';
import { Users, Ticket, TrendingUp, Globe } from 'lucide-react';

const stats = [
  {
    icon: Ticket,
    number: '50K+',
    label: 'Events Hosted',
    description: 'Verified events worldwide',
    delay: 0.1,
  },
  {
    icon: Users,
    number: '2M+',
    label: 'Happy Attendees',
    description: 'Joined amazing experiences',
    delay: 0.2,
  },
  {
    icon: TrendingUp,
    number: '$100M+',
    label: 'Tickets Sold',
    description: 'Transaction volume',
    delay: 0.3,
  },
  {
    icon: Globe,
    number: '180+',
    label: 'Countries',
    description: 'Global reach',
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section className="w-full py-24 bg-gradient-to-br from-[#E9F1F4] via-white to-[#F8FAFB] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#2E8C96]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#2E8C96]/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center max-w-2xl mx-auto"
        >
          <span className="text-xs font-bold tracking-widest text-[#2E8C96] uppercase">Impact</span>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#1F2D3A] mt-3">
            By the Numbers
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group"
              >
                <div className="relative p-8 rounded-2xl bg-white border border-[#E9F1F4] transition-all duration-300 hover:shadow-xl hover:border-[#2E8C96]">
                  {/* Decorative background shape */}
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-[#2E8C96]/5 rounded-full blur-2xl group-hover:bg-[#2E8C96]/10 transition-colors" />

                  {/* Icon */}
                  <div className="relative mb-6 inline-flex p-3 bg-[#2E8C96]/10 rounded-xl group-hover:bg-[#2E8C96]/20 transition-colors">
                    <Icon className="w-6 h-6 text-[#2E8C96]" />
                  </div>

                  {/* Number */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: stat.delay, duration: 0.6 }}
                  >
                    <div className="text-4xl lg:text-5xl font-bold text-[#2E8C96] mb-2">
                      {stat.number}
                    </div>
                  </motion.div>

                  {/* Label */}
                  <h3 className="text-lg font-semibold text-[#1F2D3A] mb-2">
                    {stat.label}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-[#4A5568]">
                    {stat.description}
                  </p>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-[#2E8C96] to-[#2A7A84] group-hover:w-full transition-all duration-500 rounded-full" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { UserGroupIcon, CodeBracketIcon, ClockIcon, StarIcon } from '@heroicons/react/24/outline';
import { SectionHeading } from './SectionHeading';

const stats = [
  {
    icon: UserGroupIcon,
    value: '10,000+',
    label: 'Active Developers',
    color: 'from-[#2563eb] to-[#7c3aed]'
  },
  {
    icon: CodeBracketIcon,
    value: '1M+',
    label: 'Lines of Code Generated',
    color: 'from-[#7c3aed] to-[#06b6d4]'
  },
  {
    icon: ClockIcon,
    value: '500K+',
    label: 'Development Hours Saved',
    color: 'from-[#06b6d4] to-[#2563eb]'
  },
  {
    icon: StarIcon,
    value: '4.9/5',
    label: 'Average Rating',
    color: 'from-[#2563eb] to-[#7c3aed]'
  }
];

const testimonials = [
  {
    quote: "This platform has transformed how we approach development. The AI agents are like having an entire team of senior developers at your fingertips.",
    author: "Sarah Chen",
    role: "CTO, TechForward",
    avatar: "SC"
  },
  {
    quote: "The autonomous agents have cut our development time in half. They're not just tools, they're true collaborators in our development process.",
    author: "Michael Rodriguez",
    role: "Lead Developer, InnovateCorp",
    avatar: "MR"
  },
  {
    quote: "I was skeptical at first, but the results speak for themselves. The platform has become an indispensable part of our workflow.",
    author: "Emily Watson",
    role: "Engineering Manager, FutureTech",
    avatar: "EW"
  }
];

const companies = [
  {
    name: 'TechCorp',
    logo: (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-[#2563eb] to-[#7c3aed] bg-clip-text text-transparent">
          TechCorp
        </div>
      </div>
    )
  },
  {
    name: 'InnovateLabs',
    logo: (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] bg-clip-text text-transparent">
          InnovateLabs
        </div>
      </div>
    )
  },
  {
    name: 'FutureAI',
    logo: (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-[#06b6d4] to-[#2563eb] bg-clip-text text-transparent">
          FutureAI
        </div>
      </div>
    )
  },
  {
    name: 'CodeGenius',
    logo: (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-[#2563eb] to-[#7c3aed] bg-clip-text text-transparent">
          CodeGenius
        </div>
      </div>
    )
  }
];

export function SocialProof() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] opacity-50" />
      <div className="container mx-auto px-4 relative">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-8 mb-24">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-[#1e293b] to-[#334155] mb-6">
                <stat.icon className="w-8 h-8 text-[#f8fafc]" />
              </div>
              <div className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                {stat.value}
              </div>
              <div className="text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <SectionHeading
          title="Trusted by Developers"
          subtitle="Join thousands of developers who are already building the future with AI"
        />

        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#1e293b] rounded-2xl p-8 border border-[#334155] hover:border-[#7c3aed]/30 transition-all duration-300"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] flex items-center justify-center text-white font-semibold mr-4">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-[#f8fafc]">{testimonial.author}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </div>
              <p className="text-gray-300 italic">"{testimonial.quote}"</p>
            </motion.div>
          ))}
        </div>

        {/* Company Logos */}
        <div>
          <div className="text-center text-gray-400 mb-12 text-lg">
            Trusted by innovative companies worldwide
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {companies.map((company, index) => (
              <motion.div
                key={company.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="h-24 bg-[#1e293b] rounded-xl border border-[#334155] hover:border-[#7c3aed]/30 transition-all duration-300"
              >
                {company.logo}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

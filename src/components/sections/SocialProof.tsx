import React from 'react';
import { motion } from 'framer-motion';
import { UserGroupIcon, CodeBracketIcon, ClockIcon, StarIcon } from '@heroicons/react/24/outline';
import { SectionHeading } from './SectionHeading';

const stats = [
  {
    id: 1,
    name: 'Active Users',
    value: '10,000+',
    icon: UserGroupIcon,
  },
  {
    id: 2,
    name: 'Lines of Code',
    value: '1M+',
    icon: CodeBracketIcon,
  },
  {
    id: 3,
    name: 'Hours Saved',
    value: '100,000+',
    icon: ClockIcon,
  },
  {
    id: 4,
    name: 'User Rating',
    value: '4.9/5',
    icon: StarIcon,
  },
];

const testimonials = [
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'Senior Developer at TechCorp',
    quote:
      'This platform has revolutionized how we handle our development workflow. The AI integration is seamless.',
    image: '/testimonials/sarah.jpg',
  },
  {
    id: 2,
    name: 'Michael Rodriguez',
    role: 'Tech Lead at InnovateLabs',
    quote: 'The autonomous agent features have saved our team countless hours. Highly recommended!',
    image: '/testimonials/michael.jpg',
  },
  {
    id: 3,
    name: 'Emily Thompson',
    role: 'CTO at FutureTech',
    quote: 'A game-changer for our development process. The AI capabilities are truly impressive.',
    image: '/testimonials/emily.jpg',
  },
];

const companies = [
  {
    id: 1,
    name: 'TechCorp',
    logo: '/companies/techcorp.svg',
  },
  {
    id: 2,
    name: 'InnovateLabs',
    logo: '/companies/innovatelabs.svg',
  },
  {
    id: 3,
    name: 'FutureTech',
    logo: '/companies/futuretech.svg',
  },
  {
    id: 4,
    name: 'NextGen',
    logo: '/companies/nextgen.svg',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export const SocialProof = () => {
  return (
    <section className="py-24 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Trusted by Developers"
          subtitle="Join thousands of developers who are already using our platform"
        />

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map(stat => (
            <motion.div
              key={stat.id}
              variants={itemVariants}
              className="bg-gray-800 rounded-lg p-6 text-center"
            >
              <div className="flex justify-center mb-4">
                <stat.icon className="h-8 w-8 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-gray-400">{stat.name}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <div className="mt-24 grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map(testimonial => (
            <motion.div
              key={testimonial.id}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-gray-800 rounded-lg p-6"
            >
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="h-12 w-12 rounded-full"
                />
                <div className="ml-4">
                  <div className="text-white font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </div>
              <p className="text-gray-300 italic">&quot;{testimonial.quote}&quot;</p>
            </motion.div>
          ))}
        </div>

        {/* Company Logos */}
        <div>
          <div className="text-center text-gray-400 mb-12 text-lg">
            Empowering teams at leading companies
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {companies.map(company => (
              <div
                key={company.id}
                className="col-span-1 flex justify-center items-center grayscale opacity-50 hover:opacity-100 transition-opacity"
              >
                <img className="h-12" src={company.logo} alt={company.name} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

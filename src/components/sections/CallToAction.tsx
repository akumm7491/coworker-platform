import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/outline';
import { SectionHeading } from './SectionHeading';

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for trying out the platform',
    features: [
      'Up to 3 AI agents',
      'Basic code generation',
      'Community support',
      'Standard response time'
    ],
    cta: 'Get Started',
    color: 'from-[#2563eb] to-[#7c3aed]'
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'Everything you need for serious development',
    features: [
      'Unlimited AI agents',
      'Advanced code generation',
      'Priority support',
      'Custom workflows',
      'Team collaboration',
      'API access'
    ],
    cta: 'Start Free Trial',
    color: 'from-[#7c3aed] to-[#06b6d4]',
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large teams and organizations',
    features: [
      'Custom AI agents',
      'Dedicated support',
      'SLA guarantees',
      'Advanced security',
      'Custom integrations',
      'Training & onboarding'
    ],
    cta: 'Contact Sales',
    color: 'from-[#06b6d4] to-[#2563eb]'
  }
];

export function CallToAction() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#1e293b] opacity-50" />
      <div className="container mx-auto px-4 relative">
        <SectionHeading
          title="Start Building the Future"
          subtitle="Choose the plan that best fits your needs"
        />

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-[#1e293b] rounded-2xl p-8 border ${
                plan.popular ? 'border-[#7c3aed]' : 'border-[#334155]'
              } hover:border-[#7c3aed]/30 transition-all duration-300 flex flex-col h-full`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] text-white text-sm font-semibold py-1 px-4 rounded-full">
                    Most Popular
                  </div>
                </div>
              )}
              
              <div>
                <div className={`text-2xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent mb-2`}>
                  {plan.name}
                </div>
                
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold text-[#f8fafc]">{plan.price}</span>
                  {plan.period && <span className="text-gray-400 ml-1">{plan.period}</span>}
                </div>
                
                <p className="text-gray-400 mb-6">{plan.description}</p>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start text-[#f8fafc]">
                      <CheckIcon className="w-5 h-5 text-[#06b6d4] mr-2 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-auto">
                <button
                  className={`w-full py-3 px-6 rounded-lg font-semibold bg-gradient-to-r ${plan.color} text-white hover:opacity-90 transition-opacity duration-300`}
                >
                  {plan.cta}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-gray-400">
            Need a custom solution?{' '}
            <a href="#contact" className="text-[#06b6d4] hover:text-[#7c3aed] transition-colors duration-300">
              Contact our sales team
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

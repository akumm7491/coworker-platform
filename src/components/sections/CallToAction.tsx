import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/outline';
import { SectionHeading } from './SectionHeading';
import { useAuth } from '@/contexts/AuthContext';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for trying out the platform',
    features: [
      'Up to 3 AI agents',
      'Basic code generation',
      'Community support',
      'Standard response time',
      'Public repositories',
      'Basic analytics'
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
  const { openSignup } = useAuth();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const handleAction = (cta: string) => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
      return;
    }

    switch (cta) {
      case 'Contact Sales':
        window.location.href = 'mailto:sales@coworker.ai';
        break;
      case 'Start Free Trial':
      case 'Get Started':
      default:
        openSignup();
        break;
    }
  };

  return (
    <section id="pricing" className="py-24 relative bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 opacity-50" />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
        <SectionHeading
          title="Simple, transparent pricing"
          subtitle="Choose the plan that's right for you"
          centered
          light
        />

        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-stretch gap-8 sm:mt-20 lg:max-w-none lg:grid-cols-3">
          {plans.map((plan, planIdx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: planIdx * 0.1 }}
              className={`relative flex flex-col min-h-[600px] ${
                plan.popular
                  ? 'bg-gray-800 border border-indigo-500 rounded-3xl shadow-2xl shadow-indigo-500/20'
                  : 'bg-gray-800/50 border border-gray-700 rounded-3xl'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-0 right-0 mx-auto w-32">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold py-1 px-4 rounded-full text-center">
                    Most popular
                  </div>
                </div>
              )}
              <div className="p-8 flex-grow">
                <div className="flex flex-col h-full">
                  <div>
                    <h3 className={`text-xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
                      {plan.name}
                    </h3>
                    <p className="mt-4 text-sm text-gray-400">{plan.description}</p>
                    <div className="mt-6 flex items-baseline gap-x-1">
                      <span className="text-5xl font-bold text-white">{plan.price}</span>
                      {plan.period && (
                        <span className="text-sm font-semibold text-gray-400">{plan.period}</span>
                      )}
                    </div>
                  </div>
                  
                  <ul role="list" className="mt-8 space-y-3 text-sm text-gray-300 flex-grow">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3 items-start">
                        <CheckIcon className={`h-5 w-5 flex-none bg-gradient-to-r ${plan.color} bg-clip-text`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="p-8 pt-0">
                <motion.button
                  onClick={() => handleAction(plan.cta)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full rounded-xl py-3 px-6 text-center text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-shadow bg-gradient-to-r ${plan.color}`}
                >
                  {isAuthenticated && plan.cta !== 'Contact Sales' ? 'Go to Dashboard' : plan.cta}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

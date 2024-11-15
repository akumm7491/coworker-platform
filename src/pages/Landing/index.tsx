import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  SparklesIcon,
  BoltIcon,
  BeakerIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  CircleStackIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '@/store/slices/authSlice';
import { ParticleBackground } from '@/components/ui/ParticleBackground';
import { FeatureCard } from '@/components/ui/FeatureCard';
import { TypedText } from '@/components/ui/TypedText';
import { InteractiveDemo } from '@/components/sections/InteractiveDemo';
import { SocialProof } from '@/components/sections/SocialProof';
import { CallToAction } from '@/components/sections/CallToAction';

const features = [
  {
    icon: SparklesIcon,
    title: 'AI-Powered Automation',
    description: 'Intelligent agents that learn and adapt to your development workflow, making decisions in real-time.',
    color: 'from-[#2563eb] to-[#7c3aed]'
  },
  {
    icon: BoltIcon,
    title: 'Real-time Collaboration',
    description: 'Seamless coordination between human developers and AI agents for maximum efficiency.',
    color: 'from-[#7c3aed] to-[#06b6d4]'
  },
  {
    icon: BeakerIcon,
    title: 'Smart Testing',
    description: 'Automated test generation and execution with AI-driven coverage optimization.',
    color: 'from-[#06b6d4] to-[#2563eb]'
  },
  {
    icon: RocketLaunchIcon,
    title: 'Automated Deployment',
    description: 'One-click deployments with built-in safety checks and rollback capabilities.',
    color: 'from-[#2563eb] to-[#7c3aed]'
  },
  {
    icon: LightBulbIcon,
    title: 'Intelligent Insights',
    description: 'Real-time analytics and AI-powered recommendations for code optimization.',
    color: 'from-[#7c3aed] to-[#06b6d4]'
  },
  {
    icon: CircleStackIcon,
    title: 'Scalable Infrastructure',
    description: 'Cloud-native architecture that automatically scales with your needs.',
    color: 'from-[#06b6d4] to-[#2563eb]'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Enterprise Security',
    description: 'Bank-grade security with end-to-end encryption and advanced access controls.',
    color: 'from-[#2563eb] to-[#7c3aed]'
  }
];

const Landing = () => {
  const dispatch = useDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const handleLogin = () => {
    dispatch(loginSuccess({
      id: '1',
      email: 'user@example.com',
      name: 'Test User'
    }));
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0f172a] font-['Inter'] text-[#f8fafc] relative overflow-hidden">
      <ParticleBackground />
      
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center">
        <motion.div 
          style={{ y, opacity }}
          className="container mx-auto px-4 pt-32 pb-24 relative"
        >
          <div className="text-center max-w-4xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="font-['Space_Grotesk'] text-6xl sm:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-[#2563eb] via-[#7c3aed] to-[#06b6d4] bg-clip-text text-transparent inline-block">
                  <div className="mb-2 leading-tight">The Future of Software Development is</div>
                  <div className="flex items-center justify-center min-h-[1.2em]">
                    <TypedText 
                      words={[
                        'Autonomous',
                        'Intelligent',
                        'Limiteless',
                        'Revolutionary',
                        'Magical'
                      ]}
                      typingSpeed={100}
                      deletingSpeed={50}
                      delayBetweenWords={2000}
                      className="min-w-[300px] px-1"
                    />
                  </div>
                </span>
              </h1>
              <p className="text-2xl text-gray-300 mb-8">
                AI Agents that learn, collaborate, and build together
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center gap-6"
            >
              <button
                onClick={handleLogin}
                className="px-8 py-4 bg-gradient-to-r from-[#2563eb] to-[#7c3aed] rounded-lg font-semibold text-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-[#7c3aed]/20"
              >
                Get Started Free
              </button>
              <button className="px-8 py-4 border-2 border-[#7c3aed] rounded-lg font-semibold text-lg hover:bg-[#7c3aed]/10 transition-all duration-300">
                Watch Demo
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] opacity-50" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="font-['Space_Grotesk'] text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-[#2563eb] via-[#7c3aed] to-[#06b6d4] bg-clip-text text-transparent">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-300">
              A complete suite of AI-powered development tools designed to transform your workflow
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#2563eb]/5 via-[#7c3aed]/5 to-[#06b6d4]/5 rounded-3xl -m-4 blur-3xl" />
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Demo Section */}
      <InteractiveDemo />

      {/* Social Proof Section */}
      <SocialProof />

      {/* Call to Action Section */}
      <CallToAction />
    </div>
  );
};

export default Landing;

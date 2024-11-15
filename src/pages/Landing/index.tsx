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
  CpuChipIcon,
} from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { ParticleBackground } from '@/components/ui/ParticleBackground';
import { FeatureCard } from '@/components/ui/FeatureCard';
import { TypedText } from '@/components/ui/TypedText';
import { InteractiveDemo } from '@/components/sections/InteractiveDemo';
import { SocialProof } from '@/components/sections/SocialProof';
import { CallToAction } from '@/components/sections/CallToAction';
import { useAuth } from '@/contexts/AuthContext';

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
    description: 'Work seamlessly with your team and AI agents in real-time, enhancing productivity and creativity.',
    color: 'from-[#7c3aed] to-[#06b6d4]'
  },
  {
    icon: BeakerIcon,
    title: 'Continuous Learning',
    description: 'Agents that continuously learn from your feedback and adapt to your specific needs and preferences.',
    color: 'from-[#06b6d4] to-[#2563eb]'
  }
];

const typedWords = [
  'AI Development',
  'Pair Programming',
  'Code Generation',
  'Team Collaboration'
];

function Landing() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end start']
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const position = useTransform(scrollYProgress, (pos) => {
    return pos === 1 ? 'relative' : 'fixed';
  });

  const { openSignup } = useAuth();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    } else {
      openSignup();
    }
  };

  return (
    <div className="bg-gray-900 text-white">
      <div ref={targetRef} className="min-h-screen">
        <motion.div
          style={{ opacity, scale, position }}
          className="w-full min-h-screen top-0 flex items-center justify-center p-4"
        >
          <ParticleBackground className="absolute inset-0" />

          <div className="text-center z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                The Future of
                <br />
                <TypedText
                  words={typedWords}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text"
                />
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Experience the next generation of software development with AI agents that understand,
                learn, and collaborate with your team in real-time.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center gap-6"
            >
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-[#2563eb] to-[#7c3aed] rounded-lg font-semibold text-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-[#7c3aed]/20"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
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
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
              Supercharge Your Development
            </h2>
            <p className="text-xl text-gray-300">
              Our platform combines cutting-edge AI technology with intuitive design to transform
              your development workflow.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} delay={index * 0.1} />
            ))}
          </div>
        </div>
      </div>

      <InteractiveDemo />
      <SocialProof />
      <CallToAction />
    </div>
  );
}

export default Landing;

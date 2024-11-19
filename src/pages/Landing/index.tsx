import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { SparklesIcon, BoltIcon, BeakerIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { ParticleBackground } from '@/components/ui/ParticleBackground';
import { FeatureCard } from '@/components/ui/FeatureCard';
import { TypedText } from '@/components/ui/TypedText';
import { InteractiveDemo } from '@/components/sections/InteractiveDemo';
import { SocialProof } from '@/components/sections/SocialProof';
import { CallToAction } from '@/components/sections/CallToAction';
import { LoginModal } from '@/components/auth/LoginModal';
import { SignupModal } from '@/components/auth/SignupModal';
import { useAuth } from '@/contexts/AuthContext';

const features = [
  {
    icon: SparklesIcon,
    title: 'AI-Powered Automation',
    description:
      'Intelligent agents that learn and adapt to your development workflow, making decisions in real-time.',
    color: 'from-[#2563eb] to-[#7c3aed]',
  },
  {
    icon: BoltIcon,
    title: 'Real-time Collaboration',
    description:
      'Work seamlessly with your team and AI agents in real-time, enhancing productivity and creativity.',
    color: 'from-[#7c3aed] to-[#06b6d4]',
  },
  {
    icon: BeakerIcon,
    title: 'Continuous Learning',
    description:
      'Agents that continuously learn from your feedback and adapt to your specific needs and preferences.',
    color: 'from-[#06b6d4] to-[#2563eb]',
  },
];

const typedWords = ['AI Development', 'Pair Programming', 'Code Generation', 'Team Collaboration'];

function Landing() {
  const targetRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const position = useTransform(scrollYProgress, pos => {
    return pos === 1 ? 'relative' : 'fixed';
  });

  const { isAuthenticated, openSignup, isLoginOpen, isSignupOpen, closeModals } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
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
                Experience the next generation of software development with AI agents that
                understand, learn, and collaborate with your team in real-time.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>
        </div>

        <InteractiveDemo />
        <SocialProof />
        <CallToAction onGetStarted={handleGetStarted} />
      </div>

      {isLoginOpen && <LoginModal onClose={closeModals} />}
      {isSignupOpen && <SignupModal onClose={closeModals} />}
    </div>
  );
}

export default Landing;

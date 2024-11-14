// Update only the features data and Features section in the existing LandingPage component
const features = [
  {
    icon: SparklesIcon,
    title: 'AI-Powered Automation',
    description: 'Intelligent agents that learn and adapt to your development workflow, making decisions in real-time.',
    color: 'bg-blue-500'
  },
  {
    icon: BoltIcon,
    title: 'Real-time Collaboration',
    description: 'Seamless coordination between human developers and AI agents for maximum efficiency.',
    color: 'bg-indigo-500'
  },
  {
    icon: BeakerIcon,
    title: 'Smart Testing',
    description: 'Automated test generation and execution with AI-driven coverage optimization.',
    color: 'bg-purple-500'
  },
  {
    icon: RocketLaunchIcon,
    title: 'Automated Deployment',
    description: 'One-click deployments with built-in safety checks and rollback capabilities.',
    color: 'bg-pink-500'
  },
  {
    icon: LightBulbIcon,
    title: 'Intelligent Insights',
    description: 'Real-time analytics and AI-powered recommendations for code optimization.',
    color: 'bg-yellow-500'
  },
  {
    icon: CircleStackIcon,
    title: 'Scalable Infrastructure',
    description: 'Cloud-native architecture that automatically scales with your needs.',
    color: 'bg-green-500'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Enterprise Security',
    description: 'Bank-grade security with end-to-end encryption and advanced access controls.',
    color: 'bg-red-500'
  },
  {
    icon: CogIcon,
    title: 'Custom Workflows',
    description: 'Fully customizable automation pipelines tailored to your specific requirements.',
    color: 'bg-teal-500'
  }
]

// Replace the existing Features section with this updated version
<div className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
  <div className="absolute inset-0 dot-pattern opacity-30" />
  <div className="container mx-auto px-4 relative">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center max-w-3xl mx-auto mb-20"
    >
      <span className="inline-block px-4 py-1 bg-indigo-50 rounded-full text-indigo-600 font-medium mb-4">
        Features
      </span>
      <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        Everything You Need
      </h2>
      <p className="text-xl text-gray-600">
        A complete suite of AI-powered development tools designed to transform your workflow and boost productivity
      </p>
    </motion.div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl -m-4 blur-3xl" />
      
      {features.map((feature, index) => (
        <FeatureCard
          key={index}
          {...feature}
          delay={index * 0.1}
        />
      ))}
    </div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.4 }}
      className="mt-16 text-center"
    >
      <button
        onClick={() => {}}
        className="inline-flex items-center space-x-2 text-indigo-600 font-medium hover:text-indigo-700 transition-colors duration-300"
      >
        <span>View All Features</span>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>
    </motion.div>
  </div>
</div>

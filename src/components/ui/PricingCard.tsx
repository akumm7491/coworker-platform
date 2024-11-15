import { motion } from 'framer-motion'
import { GradientButton } from './GradientButton'
import { CheckIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

interface PricingCardProps {
  name: string
  price: string
  description: string
  features: string[]
  isPopular?: boolean
  delay?: number
}

export function PricingCard({
  name,
  price,
  description,
  features,
  isPopular = false,
  delay = 0
}: PricingCardProps) {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`${
        isPopular ? 'pricing-card-popular glow' : 'pricing-card'
      } p-8 relative`}
    >
      {isPopular && (
        <div className="absolute top-0 right-6 transform -translate-y-1/2">
          <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
      <div className="mt-4 flex items-baseline">
        <span className="text-4xl font-bold gradient-text">{price}</span>
        <span className="text-gray-500 ml-2">/month</span>
      </div>
      <p className="mt-2 text-gray-600">{description}</p>
      <ul className="mt-6 space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
              <CheckIcon className="h-3 w-3 text-white" />
            </div>
            <span className="ml-3 text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <GradientButton
          variant={isPopular ? 'primary' : 'secondary'}
          className="w-full"
          onClick={handleGetStarted}
        >
          {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
        </GradientButton>
      </div>
    </motion.div>
  )
}

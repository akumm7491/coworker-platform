import { motion } from 'framer-motion'
import { ElementType } from 'react'

interface FeatureCardProps {
  icon: ElementType
  title: string
  description: string
  color: string
  delay?: number
}

export function FeatureCard({ icon: Icon, title, description, color, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group relative p-8 rounded-2xl bg-white hover:bg-gray-50 transition-all duration-300 border border-gray-100"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full ${color} opacity-10 transition-opacity duration-300 group-hover:opacity-20`} />
      
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-xl ${color} bg-opacity-10 flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-300">
          {title}
        </h3>
        
        <p className="text-gray-600">
          {description}
        </p>

        <div className="mt-6 flex items-center text-sm font-medium text-indigo-600 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          Learn more
          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </motion.div>
  )
}

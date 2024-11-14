import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface BadgeProps {
  status: 'idle' | 'working' | 'error' | 'active' | 'paused' | 'completed'
  animate?: boolean
  children?: ReactNode
}

export function Badge({ status, animate = true, children }: BadgeProps) {
  const colors = {
    idle: 'bg-gray-100 text-gray-800',
    working: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    active: 'bg-blue-100 text-blue-800',
    paused: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-purple-100 text-purple-800'
  }

  const pulseAnimation = animate && (status === 'working' || status === 'active')
    ? {
        scale: [1, 1.05, 1],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    : {}

  return (
    <motion.span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}
      animate={pulseAnimation}
    >
      {children || status}
    </motion.span>
  )
}

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GradientButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  variant?: 'primary' | 'secondary'
}

export function GradientButton({
  children,
  onClick,
  className = '',
  variant = 'primary'
}: GradientButtonProps) {
  const baseStyles = "relative px-8 py-3 rounded-xl font-medium overflow-hidden"
  const variantStyles = variant === 'primary'
    ? "gradient-button text-white"
    : "bg-white text-gray-900 border border-gray-200 hover:border-gray-300"

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variantStyles} ${className}`}
      onClick={onClick}
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600/20 to-indigo-600/20 blur-xl" />
    </motion.button>
  )
}
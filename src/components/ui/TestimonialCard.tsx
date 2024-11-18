import { motion } from 'framer-motion';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  image: string;
  delay?: number;
}

export function TestimonialCard({
  quote,
  author,
  role,
  company,
  image,
  delay = 0,
}: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="testimonial-card p-6"
    >
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-sm" />
          <img src={image} alt={author} className="w-12 h-12 rounded-full relative" />
        </div>
        <div>
          <div className="font-medium text-gray-900">{author}</div>
          <div className="text-sm text-gray-500">
            {role} at {company}
          </div>
        </div>
      </div>
      <p className="text-gray-600 italic leading-relaxed">&quot;{quote}&quot;</p>
    </motion.div>
  );
}

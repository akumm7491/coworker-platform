import { motion } from 'framer-motion';

interface SectionHeadingProps {
  title: string;
  subtitle: string;
}

export function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center max-w-3xl mx-auto mb-20"
    >
      <h2 className="font-['Space_Grotesk'] text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-[#2563eb] via-[#7c3aed] to-[#06b6d4] bg-clip-text text-transparent leading-tight pb-1">
        {title}
      </h2>
      <p className="text-xl text-gray-300 leading-relaxed">{subtitle}</p>
    </motion.div>
  );
}

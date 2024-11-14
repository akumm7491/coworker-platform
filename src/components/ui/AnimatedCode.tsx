import { motion } from 'framer-motion'

export function AnimatedCode() {
  const codeLines = [
    'class AutoAgent extends AI {',
    '  async analyze(task) {',
    '    const solution = await this.think(task)',
    '    return this.optimize(solution)',
    '  }',
    '  ',
    '  deploy(code) {',
    '    if (this.validate(code)) {',
    '      return this.execute(code)',
    '    }',
    '  }',
    '}'
  ]

  return (
    <div className="bg-gray-900 rounded-xl p-6 font-mono text-sm">
      {codeLines.map((line, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="text-gray-300"
        >
          {line}
        </motion.div>
      ))}
    </div>
  )
}

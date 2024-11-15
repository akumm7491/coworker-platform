import React from 'react';
import { motion } from 'framer-motion';
import { CodeBracketIcon, CpuChipIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { SectionHeading } from './SectionHeading';

export function InteractiveDemo() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#1e293b] opacity-50" />
      <div className="container mx-auto px-4 relative">
        <SectionHeading
          title="See It In Action"
          subtitle="Experience the power of autonomous development in real-time"
        />

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-[#1e293b] rounded-2xl p-8 border border-[#334155] hover:border-[#7c3aed]/30 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#7c3aed] bg-opacity-10 flex items-center justify-center mb-6">
              <CodeBracketIcon className="w-6 h-6 text-[#f8fafc]" />
            </div>
            <h3 className="font-['Space_Grotesk'] text-2xl font-bold mb-4 text-[#f8fafc]">
              Live Code Generation
            </h3>
            <p className="text-gray-400 mb-6">
              Watch AI agents generate, review, and optimize code in real-time
            </p>
            <div className="bg-[#0f172a] rounded-lg p-4 font-mono text-sm text-[#06b6d4]">
              <pre className="whitespace-pre-wrap">
                {`> Generating API endpoint...
> Optimizing performance...
> Adding security measures...
✓ Code ready for review`}
              </pre>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-[#1e293b] rounded-2xl p-8 border border-[#334155] hover:border-[#7c3aed]/30 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] bg-opacity-10 flex items-center justify-center mb-6">
              <CpuChipIcon className="w-6 h-6 text-[#f8fafc]" />
            </div>
            <h3 className="font-['Space_Grotesk'] text-2xl font-bold mb-4 text-[#f8fafc]">
              Workflow Automation
            </h3>
            <p className="text-gray-400 mb-6">
              Visualize how AI agents collaborate and automate complex workflows
            </p>
            <div className="bg-[#0f172a] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#06b6d4]">Task Progress</span>
                <span className="text-[#06b6d4]">78%</span>
              </div>
              <div className="w-full h-2 bg-[#334155] rounded-full overflow-hidden">
                <div className="h-full w-[78%] bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] rounded-full" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-[#1e293b] rounded-2xl p-8 border border-[#334155] hover:border-[#7c3aed]/30 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#2563eb] bg-opacity-10 flex items-center justify-center mb-6">
              <ChartBarIcon className="w-6 h-6 text-[#f8fafc]" />
            </div>
            <h3 className="font-['Space_Grotesk'] text-2xl font-bold mb-4 text-[#f8fafc]">
              Real-time Analytics
            </h3>
            <p className="text-gray-400 mb-6">
              Monitor performance metrics and resource utilization in real-time
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'CPU Usage', value: '42%' },
                { label: 'Memory', value: '2.4GB' },
                { label: 'Tasks', value: '145' },
                { label: 'Uptime', value: '99.9%' }
              ].map((metric) => (
                <div key={metric.label} className="bg-[#0f172a] rounded-lg p-3">
                  <div className="text-sm text-gray-400">{metric.label}</div>
                  <div className="text-lg font-semibold text-[#06b6d4]">{metric.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

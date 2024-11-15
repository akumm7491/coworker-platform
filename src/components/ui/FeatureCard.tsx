import React from 'react';

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

export function FeatureCard({ icon: Icon, title, description, color }: FeatureCardProps) {
  return (
    <div className="bg-[#1e293b] rounded-2xl p-8 border border-[#334155] hover:border-[#7c3aed]/30 transition-all duration-300 h-full flex flex-col">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} bg-opacity-10 flex items-center justify-center mb-6`}>
        <Icon className="w-6 h-6 text-[#f8fafc]" />
      </div>
      
      <h3 className={`text-xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent mb-4`}>
        {title}
      </h3>
      
      <p className="text-gray-400 flex-grow">{description}</p>
    </div>
  );
}

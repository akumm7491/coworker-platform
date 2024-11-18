import { Tab } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface TabItem {
  name: string;
  icon?: React.ElementType;
}

interface TabGroupProps {
  tabs: TabItem[];
  children: ReactNode[];
  variant?: 'primary' | 'neutral';
}

export function TabGroup({ tabs, children, variant = 'primary' }: TabGroupProps) {
  const baseColors =
    variant === 'primary'
      ? {
          selected: 'bg-gradient-to-r from-indigo-600 to-purple-600',
          hover: 'hover:text-gray-800 hover:bg-white',
          text: 'text-gray-600',
        }
      : {
          selected: 'bg-gradient-to-r from-gray-700 to-slate-700',
          hover: 'hover:text-gray-800 hover:bg-white',
          text: 'text-gray-600',
        };

  return (
    <Tab.Group>
      <Tab.List className="flex space-x-2 rounded-xl bg-white/50 backdrop-blur-sm p-2 shadow-lg">
        {tabs.map(tab => (
          <Tab
            key={tab.name}
            className={({ selected }) =>
              `w-full rounded-lg py-3 px-4 text-sm font-medium leading-5 transition-all duration-200
              ${
                selected
                  ? `${baseColors.selected} text-white shadow-lg`
                  : `${baseColors.text} ${baseColors.hover}`
              } flex items-center justify-center space-x-2`
            }
          >
            {tab.icon && <tab.icon className="w-5 h-5" />}
            <span>{tab.name}</span>
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels className="mt-6">
        <AnimatePresence mode="wait">
          {children.map((child, index) => (
            <Tab.Panel
              key={index}
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {child}
            </Tab.Panel>
          ))}
        </AnimatePresence>
      </Tab.Panels>
    </Tab.Group>
  );
}

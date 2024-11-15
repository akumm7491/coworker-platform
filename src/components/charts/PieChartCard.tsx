import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui';
import { ReactNode } from 'react';

interface DataItem {
  name: string;
  value: number;
  color: string;
}

interface PieChartCardProps {
  title: string;
  icon?: ReactNode;
  data: DataItem[];
  className?: string;
}

export function PieChartCard({
  title,
  icon,
  data,
  className = ''
}: PieChartCardProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-gray-100">
          <p className="text-sm font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">{data.value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card hover blur className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        {icon}
      </div>
      <div className="h-64 flex flex-col">
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    className="hover:opacity-80 transition-opacity duration-200"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center items-center space-x-6 mt-2">
          {data.map((entry, index) => (
            <div key={index} className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-medium text-gray-600">
                {entry.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

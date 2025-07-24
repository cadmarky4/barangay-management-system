import React from 'react';
import type { IconType } from 'react-icons';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: IconType;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon
}) => {
  return (
    <article className="h-full flex p-4 bg-stats-card rounded-xl justify-between items-center">
      <section className="flex flex-col gap-1.5">
        <h5 className="text-sm text-smblue-400">{title}</h5>
        <h2 className="text-2xl font-bold">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h2>
      </section>
      <Icon className="text-2xl text-smblue-400" />
    </article>
  );
};

export default StatCard; 


import React from 'react';
import type { IconType } from 'react-icons';

interface InfoData {
  label: string;
  value: string;
}

interface HouseholdInfoSectionProps {
  title: string;
  icon: IconType;
  data: InfoData[];
  columns?: 1 | 2 | 3;
}

const HouseholdInfoSection: React.FC<HouseholdInfoSectionProps> = ({
  title,
  icon: Icon,
  data,
  columns = 3
}) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  };

  return (
    <section className="mb-8">
      <h3 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4 flex items-center">
        <Icon className="mr-2" />
        {title}
      </h3>
      <div className={`grid ${gridClasses[columns]} gap-6`}>
        {data.map((item, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-500 mb-1">{item.label}</label>
            <p className="text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HouseholdInfoSection;
import React from 'react';

const EatingHabitsCalendar = ({ data }) => {
  const today = new Date();
  const last30Days = Array.from({length: 30}, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const getColor = (date) => {
    const dayData = data[date];
    if (!dayData) return 'bg-gray-200';
    if (dayData.sweets > dayData.sweetsLimit) return 'bg-red-500';
    if (dayData.meals > 0 && dayData.drinks === 0) return 'bg-green-500';
    if (dayData.meals > 0 && dayData.drinks > 0) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <div className="flex space-x-1">
      {last30Days.map(date => (
        <div 
          key={date} 
          className={`w-3 h-3 ${getColor(date)} rounded-sm`}
          title={`Date: ${date}\nMeals: ${data[date]?.meals || 0}\nDrinks: ${data[date]?.drinks || 0}\nSweets: ${data[date]?.sweets || 0}`}
        />
      ))}
    </div>
  );
};

export default EatingHabitsCalendar;
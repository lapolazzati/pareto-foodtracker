import React from 'react';

interface Habit {
  meals: number;
  indulgences: number;
  drinks: number;
  sweets: number;
}

interface EatingHabitsData {
  [date: string]: Habit;
}

interface EatingHabitsCalendarProps {
  data: EatingHabitsData;
}

const EatingHabitsCalendar: React.FC<EatingHabitsCalendarProps> = ({ data }) => {
  const today = new Date();
  const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
  
  const getDaysArray = (start: Date, end: Date): string[] => {
    const arr = [];
    for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
      arr.push(new Date(dt).toISOString().split('T')[0]);
    }
    return arr;
  };

  const yearDays = getDaysArray(oneYearAgo, today);

  const getColor = (date: string): string => {
    const dayData = data[date];
    if (!dayData) return 'bg-gray-100';
    
    const score = calculateScore(dayData);
    if (score === 3) return 'bg-green-500';
    if (score === 2) return 'bg-green-400';
    if (score === 1) return 'bg-green-300';
    return 'bg-green-200';
  };

  const calculateScore = (habit: Habit): number => {
    let score = 0;
    if (habit.meals >= 3) score++; // Full meals
    if (habit.indulgences === 0 && habit.sweets === 0) score++; // No indulgences or sweets
    if (habit.drinks === 0) score++; // No alcohol
    return score;
  };

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-wrap gap-1" style={{ width: 'max-content' }}>
        {yearDays.map(date => (
          <div
            key={date}
            className={`w-3 h-3 ${getColor(date)} rounded-sm hover:ring-2 hover:ring-blue-300 transition-all duration-200 cursor-pointer`}
            title={`Date: ${formatDate(date)}
Meals: ${data[date]?.meals || 0}
Indulgences: ${data[date]?.indulgences || 0}
Drinks: ${data[date]?.drinks || 0}
Sweets: ${data[date]?.sweets || 0}`}
          />
        ))}
      </div>
    </div>
  );
};

export default EatingHabitsCalendar;
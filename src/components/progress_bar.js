export default function ProgressBar({ current, limit }) {
    const percentage = Math.min((current / limit) * 100, 100);
    const barColor = percentage > 100 ? 'bg-red-500' : 'bg-green-500';
  
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div 
          className={`${barColor} h-2.5 rounded-full`} 
          style={{ width: `${percentage}%` }}
        ></div>
        <p className="text-sm mt-1">{current} / {limit}</p>
      </div>
    );
  }
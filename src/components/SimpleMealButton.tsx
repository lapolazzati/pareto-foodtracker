import React from 'react'

interface SimpleMealButtonProps {
  onMealAdded: (isIndulgence: boolean) => void
}

export default function SimpleMealButton({ onMealAdded }: SimpleMealButtonProps) {
  return (
    <div className="space-x-4">
      <button
        onClick={() => onMealAdded(false)}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Add Meal
      </button>
      <button
        onClick={() => onMealAdded(true)}
        className="bg-orange-500 text-white px-4 py-2 rounded"
      >
        Add Indulgence
      </button>
    </div>
  )
}

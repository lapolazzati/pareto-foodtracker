import { useState } from 'react';
import { supabase } from '../lib/supabaseClient'

export default function MealForm({ userId, onMealAdded }) {
  const [mealData, setMealData] = useState({
    name: '',
    indulged: false,
    image_url: '',
  });
  const [showImageUpload, setShowImageUpload] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMealData({
      ...mealData,
      [name]: type === 'checkbox' ? checked : value
    });

    if (name === 'indulged') {
      setShowImageUpload(checked);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
      const { data, error } = await supabase
        .from('meals')
        .insert({
            ...mealData,
            user_auth_id: userId,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().split(' ')[0],
            has_picture: !!mealData.picture_id,
            picture_id: mealData.picture_id || null,
        });

    if (error) {
      console.error('Error adding meal:', error);
    } else {
      console.log('Meal added successfully:', data);
      onMealAdded();
      setMealData({ name: '', is_indulgence: false, image_url: '' });
      setShowImageUpload(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold">Add a Meal</h2>
      <input
        type="text"
        name="name"
        value={mealData.name}
        onChange={handleInputChange}
        placeholder="Meal Name"
        className="w-full p-2 border rounded"
        required
      />
        <label className="flex items-center">
        <input
            type="checkbox"
            name="indulged"
            checked={mealData.indulged}
            onChange={handleInputChange}
            className="mr-2"
        />
        Is this an indulgence?
        </label>
      {showImageUpload && (
        <input
          type="text"
          name="image_url"
          value={mealData.image_url}
          onChange={handleInputChange}
          placeholder="Image URL (optional)"
          className="w-full p-2 border rounded"
        />
      )}
      <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">Add Meal</button>
    </form>
  );
}
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function SweetForm({ userId, onSweetAdded }) {
  const [sweetData, setSweetData] = useState({
    name: '',
    calories: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSweetData({ ...sweetData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('sweets')
      .insert({
        ...sweetData,
        user_auth_id: userId,
        date: new Date().toISOString().split('T')[0],
      });

    if (error) {
      console.error('Error adding sweet:', error);
    } else {
      console.log('Sweet added successfully:', data);
      onSweetAdded();
      setSweetData({ name: '', calories: '' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold">Add a Sweet</h2>
      <input
        type="text"
        name="name"
        value={sweetData.name}
        onChange={handleInputChange}
        placeholder="Sweet Name"
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="number"
        name="calories"
        value={sweetData.calories}
        onChange={handleInputChange}
        placeholder="Calories"
        className="w-full p-2 border rounded"
        required
      />
      <button type="submit" className="w-full bg-pink-500 text-white p-2 rounded">Add Sweet</button>
    </form>
  );
}
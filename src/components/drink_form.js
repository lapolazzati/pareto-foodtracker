import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function DrinkForm({ userId, onDrinkAdded }) {
  const [drinkData, setDrinkData] = useState({
    drink_type: 'beer',
  });
  const [weeklyDrinks, setWeeklyDrinks] = useState(0);
  const [weeklyLimit, setWeeklyLimit] = useState(0);

  useEffect(() => {
    fetchWeeklyDrinks();
    fetchWeeklyLimit();
  }, [userId]);

  const fetchWeeklyDrinks = async () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { count, error } = await supabase
      .from('drinks')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .gte('date', oneWeekAgo.toISOString());

    if (error) {
      console.error('Error fetching weekly drinks:', error);
    } else {
      setWeeklyDrinks(count);
    }
  };

  const fetchWeeklyLimit = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('weekly_drink_limit')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching weekly limit:', error);
    } else {
      setWeeklyLimit(data.weekly_drink_limit);
    }
  };

  const handleInputChange = (e) => {
    setDrinkData({
      ...drinkData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('drinks')
      .insert({
        ...drinkData,
        user_id: userId,
        date: new Date().toISOString(),
      });

    if (error) {
      console.error('Error adding drink:', error);
    } else {
      console.log('Drink added successfully:', data);
      onDrinkAdded();
      setDrinkData({ drink_type: 'beer' });
      fetchWeeklyDrinks();
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Add a Drink</h2>
      <p>Weekly drinks: {weeklyDrinks} / {weeklyLimit}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          name="drink_type"
          value={drinkData.drink_type}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        >
          <option value="beer">Beer</option>
          <option value="wine">Wine</option>
          <option value="other_alcoholic">Other Alcoholic Drink</option>
        </select>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Add Drink</button>
      </form>
    </div>
  );
}
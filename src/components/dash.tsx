'use client';

import React, { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Session } from '@supabase/supabase-js'
import EatingHabitsCalendar from './gh_consistency_bar'
import ProgressBar from './progress_bar'

// Define types
type Habit = {
  meals: number;
  indulgences: number;
  drinks: number;
  sweets: number;
}

type EatingHabits = {
  [date: string]: Habit;
}

export default function Dashboard({ session }: { session: Session }) {
  const [eatingHabits, setEatingHabits] = useState<EatingHabits>({})
  const [sweetsConsumed, setSweetsConsumed] = useState(0)
  const [sweetsLimit, setSweetsLimit] = useState(0)
  const [weeklyDrinks, setWeeklyDrinks] = useState(0)
  const [weeklyDrinkLimit, setWeeklyDrinkLimit] = useState(0)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (session?.user) {
      fetchData(session.user.id)
    }
  }, [session])

  const fetchData = async (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
    // Fetch meals, drinks, sweets, and user data
    const [mealsResponse, drinksResponse, sweetsResponse, userDataResponse] = await Promise.all([
      supabase.from('meals').select('date, indulged').gte('date', thirtyDaysAgo).lte('date', today).eq('user_id', userId),
      supabase.from('drinks').select('date, drink_type').gte('date', thirtyDaysAgo).lte('date', today).eq('user_id', userId),
      supabase.from('sweets').select('date').gte('date', thirtyDaysAgo).lte('date', today).eq('user_id', userId),
      supabase.from('users').select('sweets_limit, weekly_drink_limit').eq('id', userId).single()
    ]);

    const { data: meals, error: mealsError } = mealsResponse;
    const { data: drinks, error: drinksError } = drinksResponse;
    const { data: sweets, error: sweetsError } = sweetsResponse;
    const { data: userData, error: userError } = userDataResponse;

    if (mealsError) console.error('Error fetching meals:', mealsError);
    if (drinksError) console.error('Error fetching drinks:', drinksError);
    if (sweetsError) console.error('Error fetching sweets:', sweetsError);
    if (userError) console.error('Error fetching user data:', userError);

    setSweetsLimit(userData?.sweets_limit || 0);
    setWeeklyDrinkLimit(userData?.weekly_drink_limit || 0);
  
    // Process data for EatingHabitsCalendar
    const habits: EatingHabits = {};
    meals?.forEach(meal => {
      habits[meal.date] = habits[meal.date] || { meals: 0, indulgences: 0, drinks: 0, sweets: 0 };
      habits[meal.date].meals++;
      if (meal.indulged) habits[meal.date].indulgences++;
    });
  
    drinks?.forEach(drink => {
      habits[drink.date] = habits[drink.date] || { meals: 0, indulgences: 0, drinks: 0, sweets: 0 };
      habits[drink.date].drinks++;
    });
  
    sweets?.forEach(sweet => {
      habits[sweet.date] = habits[sweet.date] || { meals: 0, indulgences: 0, drinks: 0, sweets: 0 };
      habits[sweet.date].sweets++;
    });
  
    // Fetch simple meals
    const { data: simpleMeals, error: simpleMealsError } = await supabase
      .from('simple_meals')
      .select('date, is_indulgence')
      .gte('date', thirtyDaysAgo)
      .lte('date', today)
      .eq('user_id', userId)

    if (simpleMealsError) console.error('Error fetching simple meals:', simpleMealsError)

    // Process simple meals data
    simpleMeals?.forEach(meal => {
      habits[meal.date] = habits[meal.date] || { meals: 0, indulgences: 0, drinks: 0, sweets: 0 }
      habits[meal.date].meals++
      if (meal.is_indulgence) habits[meal.date].indulgences++
    })
  
    setEatingHabits(habits);
  
    // Calculate sweets consumed today
    setSweetsConsumed(habits[today]?.sweets || 0);
  
    // Calculate weekly drinks
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const weeklyDrinksCount = drinks?.filter(drink => drink.date >= oneWeekAgo).length || 0;
    setWeeklyDrinks(weeklyDrinksCount);
  };

  const handleMealAdded = async (isIndulgence: boolean) => {
    if (session?.user) {
      const { error } = await supabase.from('simple_meals').insert({
        user_id: session.user.id,
        date: new Date().toISOString().split('T')[0],
        is_indulgence: isIndulgence
      })
      if (error) console.error('Error adding meal:', error)
      else fetchData(session.user.id)
    }
  }

  const handleDrinkAdded = async () => {
    if (session?.user) {
      const { error } = await supabase.from('drinks').insert({
        user_id: session.user.id,
        date: new Date().toISOString().split('T')[0]
      })
      if (error) console.error('Error adding drink:', error)
      else fetchData(session.user.id)
    }
  }

  const handleSweetAdded = async () => {
    if (session?.user) {
      const { error } = await supabase.from('sweets').insert({
        user_id: session.user.id,
        date: new Date().toISOString().split('T')[0]
      })
      if (error) console.error('Error adding sweet:', error)
      else fetchData(session.user.id)
    }
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.log('Error signing out:', error.message)
    else router.push('/auth')
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Progress</h2>
        <div className="space-y-4">
          <div>
            <h3>Sweets Consumed Today</h3>
            <ProgressBar current={sweetsConsumed} limit={sweetsLimit} />
          </div>
          <div>
            <h3>Weekly Drinks</h3>
            <ProgressBar current={weeklyDrinks} limit={weeklyDrinkLimit} />
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Quick Add</h2>
        <div className="flex space-x-4">
          <button onClick={() => handleMealAdded(false)} className="bg-green-500 text-white px-4 py-2 rounded">Add Meal</button>
          <button onClick={() => handleMealAdded(true)} className="bg-orange-500 text-white px-4 py-2 rounded">Add Indulgence</button>
          <button onClick={handleDrinkAdded} className="bg-blue-500 text-white px-4 py-2 rounded">Add Drink</button>
          <button onClick={handleSweetAdded} className="bg-yellow-500 text-white px-4 py-2 rounded">Add Sweet</button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Eating Habits Calendar</h2>
        <EatingHabitsCalendar data={eatingHabits} />
      </div>

      <button onClick={handleSignOut} className="bg-red-500 text-white px-4 py-2 rounded">Sign Out</button>
    </div>
  )
}
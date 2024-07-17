'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Session } from '@supabase/supabase-js'
import Dashboard from '@/components/dash';
import Auth from '@/components/auth';  // Make sure this path is correct

export default function Home() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log("Fetched session:", session)
        setSession(session)
      } catch (error) {
        console.error("Error fetching session:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session)
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!session) {
    return <Auth />  // We're now rendering the Auth component instead of redirecting
  }

  return <Dashboard session={session} />
}
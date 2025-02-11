'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function getUser() {
      try {
        // Log the current session state
        const { data: sessionData } = await supabase.auth.getSession();
        console.log('Current session:', sessionData);

        const { data: { user }, error } = await supabase.auth.getUser();
        console.log('Auth user data:', user);
        console.log('Auth error:', error);

        if (error) {
          setAuthError(error.message);
          return;
        }

        if (user) {
          setUser(user);
        } else {
          console.log('No user found, redirecting to login');
          router.push('/login');
        }
      } catch (error) {
        console.error('Dashboard error:', error);
        setAuthError(error.message);
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto">
          <p>Loading authentication state...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            <h2 className="font-bold">Authentication Error:</h2>
            <p>{authError}</p>
            <button 
              onClick={() => router.push('/login')}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto">
          <p>No authenticated user found. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">
          Welcome {user.email}
        </h1>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h2 className="font-semibold">Debug Information:</h2>
          <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
            {JSON.stringify({ user }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
} 
'use client';
import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';

export default function PublicProfile({ params }) {
  const username = use(params).username;
  const [profile, setProfile] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPublicProfile() {
      try {
        // Get profile by username
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('username', username.toLowerCase())
          .single();

        if (profileError) throw profileError;
        if (!profile) throw new Error('Profile not found');

        setProfile(profile);

        // Get their public links
        const { data: links, error: linksError } = await supabase
          .from('links')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: true });

        if (linksError) throw linksError;
        setLinks(links || []);
      } catch (error) {
        console.error('Error loading profile:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadPublicProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
          <p className="text-gray-600">
            Sorry, we couldn't find a profile for @{username}
          </p>
          <a 
            href="/"
            className="mt-4 inline-block text-blue-500 hover:text-blue-700"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">
            @{profile.username}
          </h1>
          <p className="text-gray-500 mt-2">Links</p>
        </header>

        <div className="space-y-4">
          {links.length === 0 ? (
            <p className="text-center text-gray-500">No links shared yet.</p>
          ) : (
            links.map(link => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
              >
                <h2 className="text-xl font-medium text-gray-900">{link.title}</h2>
                <p className="text-gray-500 mt-1">{link.url}</p>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 
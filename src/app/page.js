'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Fetch user's profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setProfile(profile);
        fetchUserLinks(user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserLinks(userId) {
    try {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching links:', error);
    }
  }

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setLinks([]);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  async function addLink(e) {
    e.preventDefault();
    if (!newTitle || !newUrl || !user) return;

    try {
      const { data, error } = await supabase
        .from('links')
        .insert([
          {
            title: newTitle,
            url: newUrl,
            user_id: user.id
          },
        ])
        .select();

      if (error) throw error;
      setLinks([...links, ...data]);
      setNewTitle('');
      setNewUrl('');
    } catch (error) {
      console.error('Error adding link:', error);
    }
  }

  async function removeLink(id) {
    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setLinks(links.filter(link => link.id !== id));
    } catch (error) {
      console.error('Error removing link:', error);
    }
  }

  if (loading) {
    return <div className="min-h-screen p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Links</h1>
          {user && (
            <p className="text-gray-600 mt-2">
              Welcome, {profile?.username || user.email}
              {!profile?.username && (
                <span className="text-sm text-orange-500 ml-2">
                  (No username set)
                </span>
              )}
            </p>
          )}
          {profile?.username && (
            <p className="text-sm text-gray-500 mt-1">
              Your public page: {' '}
              <a 
                href={`/${profile.username}`}
                className="text-blue-500 hover:text-blue-700 hover:underline"
              >
                {window.location.origin}/{profile.username}
              </a>
            </p>
          )}
        </div>
        <div className="space-x-4">
          {user ? (
            <>
              <a 
                href="/settings" 
                className="text-gray-600 hover:text-gray-900"
              >
                Settings
              </a>
              <button
                onClick={handleSignOut}
                className="text-red-600 hover:text-red-800"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="text-gray-600 hover:text-gray-900">Login</a>
              <a href="/signup" className="text-gray-600 hover:text-gray-900">Signup</a>
            </>
          )}
        </div>
      </header>

      {user && (
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={addLink} className="space-y-4 bg-white p-6 rounded-lg shadow">
            <div>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Link Title"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="URL"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Link
            </button>
          </form>
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-4">
        {links.map(link => (
          <div key={link.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
            <div>
              <h2 className="text-xl font-medium">{link.title}</h2>
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                {link.url}
              </a>
            </div>
            {user && (
              <button
                onClick={() => removeLink(link.id)}
                className="text-red-500 hover:text-red-700 px-3 py-1 rounded"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

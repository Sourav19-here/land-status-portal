'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { UserSession, Profile } from '@/types';

interface AuthContextType {
  user: UserSession | null;
  profile: Profile | null;
  loading: boolean;
  isSupabaseConnected: boolean;
  signInWithEmail: (email: string, password?: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password?: string, displayName?: string, phone?: string) => Promise<{ error?: string }>;
  signInWithPhone: (phone: string, password?: string) => Promise<{ error?: string }>;
  signUpWithPhone: (phone: string, password?: string, displayName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  switchDemoUser: (user: UserSession | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_USERS: UserSession[] = [
  { id: 'demo-user-1', email: 'sourav.admin@domain.local', display_name: 'Sourav', phone: '+91 9876543210' },
  { id: 'demo-user-2', email: 'k.venkataiah@farmer.telangana', display_name: 'Kotha Venkataiah', phone: '+91 9848012345' },
  { id: 'demo-user-3', email: 'ramesh.c@realty.local', display_name: 'Chintala Ramesh', phone: '+91 9440156789' },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync profile from Supabase if connected
  const fetchProfile = async (userId: string) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const u: UserSession = {
            id: session.user.id,
            email: session.user.email || undefined,
            phone: session.user.phone || undefined,
            display_name:
              session.user.user_metadata?.display_name ||
              session.user.user_metadata?.full_name ||
              session.user.email?.split('@')[0] ||
              session.user.phone,
          };
          setUser(u);
          fetchProfile(session.user.id);
        }
        setLoading(false);
      });

      const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const u: UserSession = {
            id: session.user.id,
            email: session.user.email || undefined,
            phone: session.user.phone || undefined,
            display_name:
              session.user.user_metadata?.display_name ||
              session.user.user_metadata?.full_name ||
              session.user.email?.split('@')[0] ||
              session.user.phone,
          };
          setUser(u);
          fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } else {
      // In local demo fallback mode: check localStorage
      try {
        const stored = localStorage.getItem('demo_user_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          setProfile({
            id: parsed.id,
            display_name: parsed.display_name,
            phone: parsed.phone,
          });
        } else {
          setUser(DEMO_USERS[0]);
          setProfile({
            id: DEMO_USERS[0].id,
            display_name: DEMO_USERS[0].display_name,
            phone: DEMO_USERS[0].phone,
          });
        }
      } catch {
        setUser(DEMO_USERS[0]);
      }
      setLoading(false);
    }
  }, []);

  const signInWithEmail = async (email: string, password = 'password123') => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      if (data.user) {
        await fetchProfile(data.user.id);
      }
      return {};
    }

    // Demo mode: sign in with typed email
    const demoUser: UserSession = {
      id: `usr-${Date.now()}`,
      email,
      display_name: email.split('@')[0],
    };
    setUser(demoUser);
    setProfile({ id: demoUser.id, display_name: demoUser.display_name });
    localStorage.setItem('demo_user_session', JSON.stringify(demoUser));
    return {};
  };

  const signUpWithEmail = async (
    email: string,
    password = 'password123',
    displayName?: string,
    phone?: string
  ) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0],
            phone: phone || null,
          },
        },
      });
      if (error) return { error: error.message };

      if (data.user) {
        // Upsert into profiles table
        await supabase.from('profiles').upsert({
          id: data.user.id,
          display_name: displayName || email.split('@')[0],
          phone: phone || null,
        });
      }
      return {};
    }

    // Demo mode: sign up with email
    const demoUser: UserSession = {
      id: `usr-${Date.now()}`,
      email,
      phone,
      display_name: displayName || email.split('@')[0],
    };
    setUser(demoUser);
    setProfile({ id: demoUser.id, display_name: demoUser.display_name, phone });
    localStorage.setItem('demo_user_session', JSON.stringify(demoUser));
    return {};
  };

  const signInWithPhone = async (phone: string, password = 'password123') => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ phone, password });
      if (error) return { error: error.message };
      if (data.user) {
        await fetchProfile(data.user.id);
      }
      return {};
    }

    // Demo mode: phone sign-in
    const demoUser: UserSession = {
      id: `usr-${Date.now()}`,
      phone,
      display_name: `Citizen (${phone.slice(-4)})`,
    };
    setUser(demoUser);
    setProfile({ id: demoUser.id, display_name: demoUser.display_name, phone });
    localStorage.setItem('demo_user_session', JSON.stringify(demoUser));
    return {};
  };

  const signUpWithPhone = async (phone: string, password = 'password123', displayName?: string) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        phone,
        password,
        options: {
          data: {
            display_name: displayName || `Citizen (${phone.slice(-4)})`,
          },
        },
      });
      if (error) return { error: error.message };

      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          display_name: displayName || `Citizen (${phone.slice(-4)})`,
          phone,
        });
      }
      return {};
    }

    // Demo mode: phone sign-up
    const demoUser: UserSession = {
      id: `usr-${Date.now()}`,
      phone,
      display_name: displayName || `Citizen (${phone.slice(-4)})`,
    };
    setUser(demoUser);
    setProfile({ id: demoUser.id, display_name: demoUser.display_name, phone });
    localStorage.setItem('demo_user_session', JSON.stringify(demoUser));
    return {};
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    localStorage.removeItem('demo_user_session');
  };

  const switchDemoUser = (newUser: UserSession | null) => {
    setUser(newUser);
    if (newUser) {
      setProfile({
        id: newUser.id,
        display_name: newUser.display_name,
        phone: newUser.phone,
      });
      localStorage.setItem('demo_user_session', JSON.stringify(newUser));
    } else {
      setProfile(null);
      localStorage.removeItem('demo_user_session');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isSupabaseConnected: isSupabaseConfigured,
        signInWithEmail,
        signUpWithEmail,
        signInWithPhone,
        signUpWithPhone,
        signOut,
        switchDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

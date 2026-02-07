'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useConfirm } from './confirm-provider';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Session, User } from '@supabase/supabase-js';
import { signOut as localSignOut } from '@/lib/local-db';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  // pass skipConfirm = true to avoid an extra browser confirm when the caller
  // already showed a UI confirmation (e.g. an AlertDialog)
  signOut: (skipConfirm?: boolean) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const confirm = useConfirm()

  useEffect(() => {
    // Get the current session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, router]);

  const signOut = async (skipConfirm = false) => {
    try {
      if (!skipConfirm) {
        // Use global styled confirm dialog
        const ok = await confirm({
          title: 'Sign out',
          description: 'You will be redirected to the sign-in page and will need to log in again to access your account.',
          confirmLabel: 'Sign out',
          cancelLabel: 'Cancel',
        })
        if (!ok) return;
      }

      await supabase.auth.signOut();
      // Clear any local data
      try {
        localSignOut()
      } catch (e) {
        // non-fatal, just log
        // eslint-disable-next-line no-console
        console.warn('localSignOut failed', e)
      }
      router.push('/auth/signin');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error signing out', e);
      throw e;
    }
  };

  const value = {
    user,
    session,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

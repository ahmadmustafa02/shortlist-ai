import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

/**
 * Wraps the tree that needs Supabase auth. I subscribe to `onAuthStateChange` *before*
 * calling `getSession()` on purpose — that’s the pattern Supabase recommends so you
 * don’t miss a fast login/logout event that fires between mount and the session
 * promise resolving. `loading` flips false only after we’ve at least tried to read
 * the initial session, so protected routes can wait on it instead of flashing the
 * wrong UI.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    // THEN check existing session
    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      setUser(existing?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /** Thin passthrough — keeps callers from importing `supabase` just to sign out. */
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Read the current user/session + loading flag from context. Will blow up in dev if
 * you use it outside `AuthProvider` — that’s intentional so we fail loud instead of
 * silently returning the default null session forever.
 */
export const useAuth = () => useContext(AuthContext);

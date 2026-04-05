import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
  member_type: string | null;
  pole: string | null;
  filiere: string | null;
  cover_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
  refreshSession: () => Promise<Session | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const latestProfileRequestRef = useRef(0);

  const resetProfileState = useCallback(() => {
    latestProfileRequestRef.current += 1;
    setProfile(null);
    setProfileLoading(false);
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    const requestId = ++latestProfileRequestRef.current;
    setProfileLoading(true);

    try {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, member_type, pole, filiere, cover_url, linkedin_url, instagram_url, facebook_url")
        .eq("id", userId)
        .single();

      const nextProfile = data as Profile | null;

      if (requestId === latestProfileRequestRef.current) {
        setProfile(nextProfile);
      }

      return nextProfile;
    } finally {
      if (requestId === latestProfileRequestRef.current) {
        setProfileLoading(false);
      }
    }
  }, []);

  const syncAuthState = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);
    const nextUser = nextSession?.user ?? null;
    setUser(nextUser);

    try {
      if (!nextUser) {
        resetProfileState();
        return nextSession;
      }

      await fetchProfile(nextUser.id);
      return nextSession;
    } finally {
      setLoading(false);
    }
  }, [fetchProfile, resetProfileState]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void syncAuthState(nextSession);
    });

    void supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      void syncAuthState(initialSession);
    });

    return () => subscription.unsubscribe();
  }, [syncAuthState]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/email-verified`,
      },
    });
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    resetProfileState();
  };

  const refreshProfile = useCallback(async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    const activeSession = currentSession ?? session;
    const activeUser = activeSession?.user ?? user;

    if (!activeUser) {
      resetProfileState();
      return null;
    }

    if (currentSession) {
      setSession(currentSession);
      setUser(currentSession.user);
    }

    return fetchProfile(activeUser.id);
  }, [fetchProfile, resetProfileState, session, user]);

  const refreshSession = useCallback(async () => {
    setLoading(true);
    const { data: { session: currentSession } } = await supabase.auth.getSession();

    if (!currentSession) {
      await syncAuthState(null);
      return null;
    }

    const { data: { user: freshUser } } = await supabase.auth.getUser();
    const nextSession = freshUser ? { ...currentSession, user: freshUser } : currentSession;

    await syncAuthState(nextSession);
    return nextSession;
  }, [syncAuthState]);

  const emailVerified = Boolean(user?.email_confirmed_at);
  const onboardingCompleted = Boolean(profile?.member_type);

  return (
    <AuthContext.Provider value={{
      session,
      user,
      profile,
      loading,
      profileLoading,
      emailVerified,
      onboardingCompleted,
      signUp,
      signIn,
      signOut,
      refreshProfile,
      refreshSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

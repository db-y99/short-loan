"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabaseClient } from "@/lib/supabase/client";
import { getProfileClientById, TProfileClient } from "@/services/profiles.client.service";

type TProfile = TProfileClient;

type AuthContextType = {
  user: User | null;
  profile: TProfile | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<TProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      setUser(user ?? null);

      if (user) {
        const data = await getProfileClientById(user.id);
        setProfile(data);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("Error refreshing auth:", error);
      setUser(null);
      setProfile(null);
    }
  };

  useEffect(() => {
    refresh().finally(() => setIsLoading(false));

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setProfile(null);
      } else {
        // Re-fetch profile when auth state changes
        getProfileClientById(session.user.id).then(setProfile);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

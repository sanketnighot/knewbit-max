import { AuthError, Session } from "@supabase/supabase-js";

export interface KnewbitUser {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  about?: string;
  role?: string;
  joined?: string;
  streak: number;
}

export interface AuthResult {
  data: any;
  error: AuthError | null;
}

export interface AuthContextType {
  session: Session | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<AuthResult>;
  signInWithOTP: (email: string) => Promise<AuthResult>;
  verifyOTP: (email: string, token: string) => Promise<AuthResult>;
  knewbitUser: KnewbitUser | null;
  setKnewbitUser?: (user: KnewbitUser) => void;
}

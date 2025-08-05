import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
import bcrypt from "bcryptjs";

type User = {
  id: string;
  email: string;
  username: string;
  full_name: string;
  phone_number?: string;
  gender: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (emailOrUsername: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    username: string,
    phoneNumber?: string,
    gender?: string,
  ) => Promise<void>;
  updateProfile: (
    fullName: string,
    username: string,
    phoneNumber?: string,
    gender?: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("chatconnect_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem("chatconnect_user");
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    username: string,
    phoneNumber?: string,
    gender: string = "male",
  ) => {
    // First check if username is already taken
    const { data: existingUser } = await supabase
      .from("users")
      .select("username")
      .eq("username", username)
      .single();

    if (existingUser) {
      throw new Error("Username is already taken");
    }

    // Check if email is already taken
    const { data: existingEmail } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .single();

    if (existingEmail) {
      throw new Error("Email is already registered");
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate a unique ID
    const userId = crypto.randomUUID();

    // Insert user into database
    const { error } = await supabase.from("users").insert({
      id: userId,
      user_id: userId,
      email,
      full_name: fullName,
      name: fullName,
      username,
      phone_number: phoneNumber,
      password_hash: passwordHash,
      gender,
      token_identifier: email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Signup error:", error);
      throw new Error("Error creating account");
    }
  };

  const signIn = async (emailOrUsername: string, password: string) => {
    // Check if input is email or username
    const isEmail = emailOrUsername.includes("@");

    let userData;
    if (isEmail) {
      // Find user by email
      const { data, error } = await supabase
        .from("users")
        .select(
          "id, email, username, full_name, phone_number, password_hash, gender",
        )
        .eq("email", emailOrUsername)
        .single();

      if (error || !data) {
        throw new Error("Invalid email or password");
      }
      userData = data;
    } else {
      // Find user by username
      const { data, error } = await supabase
        .from("users")
        .select(
          "id, email, username, full_name, phone_number, password_hash, gender",
        )
        .eq("username", emailOrUsername)
        .single();

      if (error || !data) {
        throw new Error("Invalid username or password");
      }
      userData = data;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      userData.password_hash,
    );
    if (!isPasswordValid) {
      throw new Error("Invalid email/username or password");
    }

    // Create user object without password hash
    const user: User = {
      id: userData.id,
      email: userData.email,
      username: userData.username,
      full_name: userData.full_name,
      phone_number: userData.phone_number,
      gender: userData.gender || "male",
    };

    // Store user in state and localStorage
    setUser(user);
    localStorage.setItem("chatconnect_user", JSON.stringify(user));
  };

  const updateProfile = async (
    fullName: string,
    username: string,
    phoneNumber?: string,
    gender: string = "male",
  ) => {
    if (!user) {
      throw new Error("No user logged in");
    }

    // Check if username is already taken by another user
    if (username !== user.username) {
      const { data: existingUser } = await supabase
        .from("users")
        .select("username")
        .eq("username", username)
        .neq("id", user.id)
        .single();

      if (existingUser) {
        throw new Error("Username is already taken");
      }
    }

    // Update user in database
    const { error } = await supabase
      .from("users")
      .update({
        full_name: fullName,
        name: fullName,
        username,
        phone_number: phoneNumber,
        gender,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Update profile error:", error);
      throw new Error("Error updating profile");
    }

    // Update user in state and localStorage
    const updatedUser: User = {
      ...user,
      full_name: fullName,
      username,
      phone_number: phoneNumber,
      gender,
    };

    setUser(updatedUser);
    localStorage.setItem("chatconnect_user", JSON.stringify(updatedUser));
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem("chatconnect_user");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, updateProfile, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

import { supabase } from "../lib/supabase";

export function getSession() {
  return supabase.auth.getSession();
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

export function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

export function signUp(email, password) {
  return supabase.auth.signUp({ email, password });
}

export function sendPasswordReset(email) {
  return supabase.auth.resetPasswordForEmail(email);
}

export function verifyOtp({ email, token, type }) {
  return supabase.auth.verifyOtp({ email, token, type });
}

export function updateUser(attributes) {
  return supabase.auth.updateUser(attributes);
}

export function signOut() {
  return supabase.auth.signOut();
}

export function refreshSession() {
  return supabase.auth.refreshSession();
}

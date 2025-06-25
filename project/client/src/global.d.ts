/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare namespace App {
  // interface Error {}
  // interface Locals {}
  // interface PageData {}
  // interface Platform {}
}

// For $lib alias
declare module '$lib/supabase' {
  import { SupabaseClient } from '@supabase/supabase-js';
  export const supabase: SupabaseClient;
}

declare module '$lib/admin' {
  import { SupabaseClient } from '@supabase/supabase-js';
  export const supabaseAdmin: SupabaseClient;
  export const isAdmin: (userId: string) => Promise<boolean>;
}

// environment.d.ts

declare module '@env' {
  // Add all environment variables that you use here.
  // The 'string' type assumes all variables are strings.
  export const UNSPLASH_ACCESS_KEY: string;
  export const GEOAPIFY_API_KEY: string;
  
  // Example for another variable:
  // export const ANOTHER_API_KEY: string;
}
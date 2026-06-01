/**
 * Some setups whitelist `/oauth/callback` in Supabase; NoNews primary handler is `/auth/callback`.
 * Re-export so both paths run the same PKCE/hash handler.
 */
export { default } from "../../auth/callback/page";

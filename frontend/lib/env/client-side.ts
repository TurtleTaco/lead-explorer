import { z } from "zod";

const clientSideEnvSchema = z.object({
	NEXT_PUBLIC_VERCEL_ENV: z
		.enum(["development", "preview", "production"])
		.default("development"), // Default to development for local
	NEXT_PUBLIC_VERCEL_GIT_PULL_REQUEST_ID: z
		.string()
		.optional()
		.transform((v) => (v === "" ? undefined : v)), // Treat an empty string as undefined
	NEXT_PUBLIC_APIFY_API_KEY: z.string().optional(),
	NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
	NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
});

/**
 * Type-safe environment variables available client-side
 */
export const clientSideEnv = clientSideEnvSchema.parse({
	NEXT_PUBLIC_VERCEL_ENV:
		process.env.NEXT_PUBLIC_VERCEL_ENV || "development",
	NEXT_PUBLIC_VERCEL_GIT_PULL_REQUEST_ID:
		process.env.NEXT_PUBLIC_VERCEL_GIT_PULL_REQUEST_ID,
	NEXT_PUBLIC_APIFY_API_KEY:
		process.env.NEXT_PUBLIC_APIFY_API_KEY,
	NEXT_PUBLIC_SUPABASE_URL:
		process.env.NEXT_PUBLIC_SUPABASE_URL,
	NEXT_PUBLIC_SUPABASE_ANON_KEY:
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

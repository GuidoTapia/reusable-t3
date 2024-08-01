// @ts-check
import { z } from "zod"

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
export const serverSchema = z.object({
  /*
  EMAIL_FROM: z.string(),
  GCS_BUCKET_NAME: z.string().min(1),
  LOG_LEVEL: z.string().optional(),
  NEXTAUTH_SECRET:
    process.env.NODE_ENV === "production"
      ? z.string().min(1)
      : z.string().min(1).optional(),
  SENDGRID_API_KEY: z.string().min(1),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  POSTGRID_MAIL_API_KEY: z.string(),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET_KEY: z.string(),
  CLAIMS_EXPORT_QUERY_MAX_RESULT:
    process.env.NODE_ENV === "production" ? z.number() : z.number().optional(),
  APPLICATION:
    process.env.NODE_ENV === "production"
      ? z.enum(["PURCO", "SDI"])
      : z.string().optional(),*/
  NODE_ENV: z.enum(["development", "test", "production"]),
  DATABASE_URL: z.string().url(),
  DATABASE_PRISMA_URL: z.string().url(),
  NEXTAUTH_URL: z.string().url(),
  AXIOM_DATASET:
    process.env.NODE_ENV === "production"
      ? z.string().min(1)
      : z.string().min(1).optional(),
  AXIOM_TOKEN:
    process.env.NODE_ENV === "production"
      ? z.string().min(1)
      : z.string().min(1).optional(),
  LOG_LEVEL: z.string().optional(),
})

/**
 * You can't destruct `process.env` as a regular object in the Next.js
 * middleware, so you have to do it manually here.
 * @type {{ [k in keyof z.infer<typeof serverSchema>]: z.input<typeof serverSchema>[k] | undefined }}
 */
export const serverEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_PRISMA_URL: process.env.DATABASE_PRISMA_URL,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NODE_ENV: process.env.NODE_ENV,
  AXIOM_DATASET: process.env.AXIOM_DATASET,
  AXIOM_TOKEN: process.env.AXIOM_TOKEN,
  LOG_LEVEL: process.env.LOG_LEVEL,
  /*
  EMAIL_FROM: process.env.EMAIL_FROM,
  GCS_BUCKET_NAME: process.env.GCS_BUCKET_NAME,
  GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
  POSTGRID_MAIL_API_KEY: process.env.POSTGRID_MAIL_API_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET_KEY: process.env.STRIPE_WEBHOOK_SECRET_KEY,
  CLAIMS_EXPORT_QUERY_MAX_RESULT: Number(
    String(process.env.CLAIMS_EXPORT_QUERY_MAX_RESULT),
  ),
  APPLICATION: process.env.APPLICATION,*/
}

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
export const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  /*NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_APPLICATION: z.string(),*/
})

/**
 * You can't destruct `process.env` as a regular object, so you have to do
 * it manually here. This is because Next.js evaluates this at build time,
 * and only used environment variables are included in the build.
 * @type {{ [k in keyof z.infer<typeof clientSchema>]: z.infer<typeof clientSchema>[k] | undefined }}
 */
export const clientEnv = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  /*NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_APPLICATION: process.env.NEXT_PUBLIC_APPLICATION,*/
}

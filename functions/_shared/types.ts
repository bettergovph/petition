/// <reference types="@cloudflare/workers-types" />

export interface Env {
  DB: D1Database
  CACHE: KVNamespace
  IMAGES: R2Bucket
  AUTH_SECRET: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  FACEBOOK_CLIENT_ID: string
  FACEBOOK_CLIENT_SECRET: string
  EMAIL_ENCRYPTION_KEY?: string
  ENVIRONMENT?: string
  NODE_ENV?: string
}

export interface EventContext<E = unknown> {
  request: Request
  env: E
  params: Record<string, string>
  waitUntil(promise: Promise<unknown>): void
  next(input?: Request | string, init?: RequestInit): Promise<Response>
  data: Record<string, unknown>
}
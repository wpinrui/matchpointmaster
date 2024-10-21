/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY?: string
  readonly VITE_AUTH_DOMAIN?: string
  readonly VITE_PROJECT_ID?: string
  readonly VITE_STORAGE_BUCKET?: string
  readonly VITE_MESSAGING_SENDER_ID?: string
  readonly VITE_APP_ID?: string
  readonly VITE_MEASUREMENT_ID?: string
  readonly VITE_MAPS_API?: string
  readonly VITE_STORE_APP_URL?: string
  readonly VITE_API_HOSTNAME?: string
  readonly VITE_CLOUD_FUNCTION_URL?: string
  readonly VITE_ADMIN_EMAIL?: string
  readonly VITE_CDN_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

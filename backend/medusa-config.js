import { loadEnv, Modules, defineConfig } from '@medusajs/utils';
import {
  ADMIN_CORS,
  AUTH_CORS,
  BACKEND_URL,
  COOKIE_SECRET,
  DATABASE_URL,
  JWT_SECRET,
  REDIS_URL,
  RESEND_API_KEY,
  RESEND_FROM_EMAIL,
  SENDGRID_API_KEY,
  SENDGRID_FROM_EMAIL,
  SHOULD_DISABLE_ADMIN,
  STORE_CORS,
  STRIPE_API_KEY,
  STRIPE_WEBHOOK_SECRET,
  WORKER_MODE,
  MINIO_ENDPOINT,
  MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY,
  MINIO_BUCKET,
  MEILISEARCH_HOST,
  MEILISEARCH_ADMIN_KEY
} from './lib/constants'; // 确保路径正确，通常是 './lib/constants'

loadEnv(process.env.NODE_ENV, process.cwd());

const finalBackendUrl = process.env.BACKEND_URL || BACKEND_URL;
const finalAdminCors = process.env.ADMIN_CORS || ADMIN_CORS;
const finalAuthCors = process.env.AUTH_CORS || AUTH_CORS;

// 确保该变量是布尔值，防止字符串导致的逻辑错误
const is_admin_disabled = process.env.SHOULD_DISABLE_ADMIN === "true";

const medusaConfig = {
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL || DATABASE_URL,
    databaseLogging: false,
    redisUrl: process.env.REDIS_URL || REDIS_URL,
    workerMode: process.env.WORKER_MODE || WORKER_MODE,
    http: {
      adminCors: finalAdminCors,
      authCors: finalAuthCors,
      storeCors: process.env.STORE_CORS || STORE_CORS,
      jwtSecret: process.env.JWT_SECRET || JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET || COOKIE_SECRET
    }
  },
  admin: {
    backendUrl: finalBackendUrl,
    disable: is_admin_disabled,
    path: `/app`, // Medusa 2.0 默认管理后台路径
  },
  modules: [
    {
      key: Modules.FILE,
      resolve: '@medusajs/file',
      options: {
        providers: [
          ...(MINIO_ENDPOINT && MINIO_ACCESS_KEY && MINIO_SECRET_KEY ? [{
            resolve: './src/modules/minio-file',
            id: 'minio',
            options: {
              endPoint: MINIO_ENDPOINT,
              accessKey: MINIO_ACCESS_KEY,
              secretKey: MINIO_SECRET_KEY,
              bucket: MINIO_BUCKET
            }
          }] : [{
            resolve: '@medusajs/file-local',
            id: 'local',
            options: {
              upload_dir: 'static',
              backend_url: `${finalBackendUrl}/static`
            }
          }])
        ]
      }
    },
    ...(process.env.REDIS_URL || REDIS_URL ? [{
      key: Modules.EVENT_BUS,
      resolve: '@medusaj

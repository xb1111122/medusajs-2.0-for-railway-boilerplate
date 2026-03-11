import { loadEnv, Modules, defineConfig } from '@medusajs/utils';

// 加载环境变量
loadEnv(process.env.NODE_ENV || 'development', process.cwd());

// 基础变量定义（带默认值回退）
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:9000";
const ADMIN_CORS = process.env.ADMIN_CORS || "http://localhost:5173,http://localhost:9000";
const AUTH_CORS = process.env.AUTH_CORS || "/http:\/\/localhost:9000/";
const STORE_CORS = process.env.STORE_CORS || "http://localhost:8000";

const medusaConfig = {
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseLogging: false,
    redisUrl: process.env.REDIS_URL,
    workerMode: process.env.WORKER_MODE || "shared",
    http: {
      adminCors: ADMIN_CORS,
      authCors: AUTH_CORS,
      storeCors: STORE_CORS,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret"
    }
  },
  admin: {
    backendUrl: BACKEND_URL,
    disable: process.env.SHOULD_DISABLE_ADMIN === "true",
    path: `/app`,
  },
  modules: [
    // 缓存模块配置
    {
      key: Modules.CACHE,
      resolve: "@medusajs/cache-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    // 事件总线模块
    {
      key: Modules.EVENT_BUS,
      resolve: "@medusajs/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    // 文件模块配置
    {
      key: Modules.FILE,
      resolve: '@medusajs/file',
      options: {
        providers: [
          ...(process.env.MINIO_ENDPOINT ? [{
            resolve: './src/modules/minio-file',
            id: 'minio',
            options: {
              endPoint: process.env.MINIO_ENDPOINT,
              accessKey: process.env.MINIO_ACCESS_KEY,
              secretKey: process.env.MINIO_SECRET_KEY,
              bucket: process.env.MINIO_BUCKET
            }
          }] : [{
            resolve: '@medusajs/file-local',
            id: 'local',
            options: {
              upload_dir: 'static',
              backend_url: `${BACKEND_URL}/static`
            }
          }])
        ]
      }
    }
  ]
};

export default defineConfig(medusaConfig);

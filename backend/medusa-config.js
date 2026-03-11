import { loadEnv, Modules, defineConfig } from '@medusajs/utils';

// 加载环境变量
loadEnv(process.env.NODE_ENV || 'development', process.cwd());

// 提取变量并设置默认值，避免导入不存在的本地文件
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:9000";
const ADMIN_CORS = process.env.ADMIN_CORS || "http://localhost:5173,http://localhost:9000";
const AUTH_CORS = process.env.AUTH_CORS || "/http:\/\/localhost:9000/";
const STORE_CORS = process.env.STORE_CORS || "http://localhost:8000";

const medusaConfig = {
  projectConfig: {
    // 优先从 Railway 环境变量读取
    databaseUrl: process.env.DATABASE_URL,
    databaseLogging: false,
    redisUrl: process.env.REDIS_URL,
    workerMode: process.env.WORKER_MODE || "shared",
    http: {
      adminCors: process.env.ADMIN_CORS || ADMIN_CORS,
      authCors: process.env.AUTH_CORS || AUTH_CORS,
      storeCors: process.env.STORE_CORS || STORE_CORS,
      jwtSecret: process.env.JWT_SECRET || "supersecret_change_me",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret_change_me"
    }
  },
  admin: {
    backendUrl: BACKEND_URL,
    disable: process.env.SHOULD_DISABLE_ADMIN === "true",
    path: `/app`, 
  },
  modules: [
    // 缓存模块 (Medusa 2.0 推荐 Redis)
    ...(process.env.REDIS_URL ? [{
      key: Modules.CACHE,
      resolve: "@medusajs/cache-redis",
      options: { redisUrl: process.env.REDIS_URL },
    }] : []),
    
    // 事件总线模块
    ...(process.env.REDIS_URL ? [{
      key: Modules.EVENT_BUS,
      resolve: "@medusajs/event-bus-redis",
      options: { redisUrl: process.env.REDIS_URL },
    }] : []),

    // 文件模块
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

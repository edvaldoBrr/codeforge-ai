import serverless from 'serverless-http';
import { app } from '../../src/server/app';

const serverlessHandler = serverless(app);

export const handler = async (event: any, context: any) => {
  // Determine true path from rawUrl, path or rawPath
  let targetPath = '';
  if (event.rawUrl) {
    try {
      targetPath = new URL(event.rawUrl).pathname;
    } catch (_) {}
  }
  if (!targetPath && event.path) {
    targetPath = event.path;
  }
  if (!targetPath && event.rawPath) {
    targetPath = event.rawPath;
  }

  // Normalize: if it starts with /.netlify/functions/api, strip that prefix
  if (targetPath.startsWith('/.netlify/functions/api')) {
    targetPath = targetPath.replace(/^\/\.netlify\/functions\/api/, '') || '/';
  }

  // Ensure it starts with /api
  if (!targetPath.startsWith('/api')) {
    targetPath = '/api' + (targetPath.startsWith('/') ? targetPath : '/' + targetPath);
  }

  event.path = targetPath;
  event.rawPath = targetPath;

  return serverlessHandler(event, context);
};

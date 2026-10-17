import serverless from 'serverless-http';
import { app } from '../../src/server/app';

const serverlessHandler = serverless(app);

export const handler = async (event: any, context: any) => {
  // Handle Netlify function path mapping
  if (event.rawPath && event.rawPath.startsWith('/.netlify/functions/api')) {
    event.rawPath = event.rawPath.replace('/.netlify/functions/api', '/api');
  }
  if (event.path) {
    if (event.path.startsWith('/.netlify/functions/api')) {
      const remaining = event.path.replace('/.netlify/functions/api', '');
      event.path = remaining.startsWith('/api') ? remaining : `/api${remaining}`;
    } else if (!event.path.startsWith('/api')) {
      event.path = `/api${event.path.startsWith('/') ? event.path : `/${event.path}`}`;
    }
  }

  return serverlessHandler(event, context);
};

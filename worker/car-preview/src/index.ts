import { handleCarPreview, type Env } from './handler';

export default {
  fetch: (request: Request, env: Env): Promise<Response> => handleCarPreview(request, env),
};

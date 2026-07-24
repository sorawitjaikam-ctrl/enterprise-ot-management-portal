// Set flag to prevent express app.listen from starting standalone server
if (typeof process !== "undefined" && process.env) {
  process.env.LISTEN_PORT = "false";
  process.env.CF_WORKER = "true";
}

import app from "./server.ts";

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    // 1. Sync environment variables from Cloudflare Worker env bindings to process.env
    if (env.CLOUDFLARE_ACCOUNT_ID) process.env.CLOUDFLARE_ACCOUNT_ID = env.CLOUDFLARE_ACCOUNT_ID;
    if (env.CLOUDFLARE_DATABASE_ID) process.env.CLOUDFLARE_DATABASE_ID = env.CLOUDFLARE_DATABASE_ID;
    if (env.CLOUDFLARE_API_TOKEN) process.env.CLOUDFLARE_API_TOKEN = env.CLOUDFLARE_API_TOKEN;
    if (env.GEMINI_API_KEY) process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;

    const url = new URL(request.url);

    // 2. Route API calls to Express backend handler
    if (url.pathname.startsWith("/api")) {
      return new Promise<Response>((resolve) => {
        const bodyPromise = request.method !== "GET" && request.method !== "HEAD"
          ? request.text()
          : Promise.resolve("");

        bodyPromise.then((bodyText) => {
          let parsedBody: any = {};
          if (bodyText) {
            try {
              parsedBody = JSON.parse(bodyText);
            } catch (e) {
              parsedBody = bodyText;
            }
          }

          const req: any = {
            method: request.method,
            url: url.pathname + url.search,
            headers: Object.fromEntries(request.headers.entries()),
            body: parsedBody,
            query: Object.fromEntries(url.searchParams.entries()),
            params: {}
          };

          let statusCode = 200;
          const responseHeaders: Record<string, string> = { "Content-Type": "application/json" };

          const res: any = {
            status(code: number) {
              statusCode = code;
              return this;
            },
            setHeader(name: string, value: string) {
              responseHeaders[name.toLowerCase()] = value;
              return this;
            },
            header(name: string, value: string) {
              return this.setHeader(name, value);
            },
            json(data: any) {
              responseHeaders["content-type"] = "application/json";
              resolve(new Response(JSON.stringify(data), { status: statusCode, headers: responseHeaders }));
            },
            send(data: any) {
              const body = typeof data === "object" ? JSON.stringify(data) : String(data);
              resolve(new Response(body, { status: statusCode, headers: responseHeaders }));
            },
            end(data?: any) {
              const body = data ? String(data) : "";
              resolve(new Response(body, { status: statusCode, headers: responseHeaders }));
            }
          };

          try {
            app(req, res);
          } catch (err: any) {
            resolve(new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "content-type": "application/json" } }));
          }
        });
      });
    }

    // 3. Serve static frontend assets from env.ASSETS
    return env.ASSETS.fetch(request);
  }
};

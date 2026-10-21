type PagesFunction<T = any> = (context: {
  request: Request;
  env: T;
  next: () => Promise<Response>;
  [key: string]: any;
}) => Promise<Response>;

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  // Redirect old domain requests immediately to new marine-hrmanagement domain
  if (
    url.hostname.includes("enterprise-ot-management-portal") ||
    url.hostname.includes("its-ot-management")
  ) {
    const targetUrl = new URL(context.request.url);
    targetUrl.hostname = "marine-hrmanagement.pages.dev";
    return Response.redirect(targetUrl.toString(), 301);
  }

  return context.next();
};

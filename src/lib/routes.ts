/**
 * These are the routes that are public and do not require authentication.
 * @type {string[]}
 */
export const publicRoutes: string[] =
  process.env.NODE_ENV === "production" ? ["/"] : ["/", "/design"];

/**
 * Generated metadata images (link previews, home screen icon) must load
 * without a session, or crawlers get redirected to the login page.
 */
export const publicPrefixes: string[] = [
  "/opengraph-image",
  "/twitter-image",
  "/apple-icon",
];

/**
 * An array of routes that are used for authentication.
 * These routes do not required authentication.
 * @type {string[]}
 */

export const authRoutes: string[] = ["/login", "/create-account"];
/**
 * The prefix for the API authentication routes.
 * @type {string}
 */
export const apiAuthPrefix: string = "/api/auth";
/**
 * The default redirect URL after a user logs in. /dashboard
 * @type {string}
 */
export const DEFAULT_REDIRECT_URL: string = "/documents";

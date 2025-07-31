/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as _utils from "../_utils.js";
import type * as admin from "../admin.js";
import type * as clerkWebhook from "../clerkWebhook.js";
import type * as dashboard from "../dashboard.js";
import type * as http from "../http.js";
import type * as lessons from "../lessons.js";
import type * as messages from "../messages.js";
import type * as packages from "../packages.js";
import type * as reviews from "../reviews.js";
import type * as seed from "../seed.js";
import type * as tutorProfiles from "../tutorProfiles.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  _utils: typeof _utils;
  admin: typeof admin;
  clerkWebhook: typeof clerkWebhook;
  dashboard: typeof dashboard;
  http: typeof http;
  lessons: typeof lessons;
  messages: typeof messages;
  packages: typeof packages;
  reviews: typeof reviews;
  seed: typeof seed;
  tutorProfiles: typeof tutorProfiles;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

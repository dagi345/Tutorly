import { httpRouter } from "convex/server";
import { handleClerkUserCreated } from "./clerkWebhook";

const http = httpRouter();
http.route({ path: "/clerk", method: "POST", handler: handleClerkUserCreated });
export default http;
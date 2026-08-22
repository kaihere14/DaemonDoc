import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/api/test",
  method: "GET",
  handler: httpAction(async (_ctx, _req) => {
    return new Response(
      JSON.stringify({ message: "Hello from Convex!", timestamp: Date.now() }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  }),
});

export default http;

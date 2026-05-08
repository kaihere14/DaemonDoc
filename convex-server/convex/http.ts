import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

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
      }
    );
  }),
});

http.route({
  path: "/api/tasks",
  method: "GET",
  handler: httpAction(async (ctx, _req) => {
    const tasks = await ctx.runQuery(api.tasks.get);
    return new Response(JSON.stringify(tasks), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;

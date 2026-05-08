import { makeFunctionReference } from "convex/server";
import client from "../services/convex.service.js";

const tasksGet = makeFunctionReference("tasks:get");

export async function getTasks(req, res) {
  const tasks = await client.query(tasksGet);
  res.json(tasks);
}

export async function testConvexConnection(req, res) {
  const tasks = await client.query(tasksGet);
  res.json({ message: "Convex connection successful", count: tasks.length });
}

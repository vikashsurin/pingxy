import { describe, test, expect } from "bun:test";
import { Hono } from "hono";

// Import your actual router
import { profileRouter } from "../profile.routes";   // adjust path

const cookie = '_Host-session=1d821288-b509-4040-9788-f8ae44dc3fdd'
// Create test app and mount your router
const app = new Hono();
app.route("/api/profiles", profileRouter);   // or app.route("/", profilesRouter) if already prefixed

describe("Profiles API", () => {
  test("POST /api/profiles creates a profile", async () => {
    const payload = {
      gender: "male",
      age: 24,
      country: "IN",
      bio: "I am Venom"
    };

    const res = await app.request("/api/profiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": "_Host-session=1d821288-b509-4040-9788-f8ae44dc3fdd"

      },
      body: JSON.stringify(payload),

    });

    const data = await res.json();
    console.log(data)

    expect(res.status).toBe(201);        // or 201
    expect(data).toHaveProperty("id");
    expect(data).toHaveProperty("userId", 2);
    expect(data).toHaveProperty("username"); // if you're returning it
    expect(data.gender).toBe("male");
  });
});

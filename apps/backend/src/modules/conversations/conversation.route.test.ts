import { describe, expect, test } from "bun:test";

describe("Conversations Table Schema", () => {
  const cookieValue = "56eafe25-ff10-404a-8892-3398d796a50a";
  const Cookie = `_Host-session=${cookieValue}`;

  test("GET /conversations", async () => {
    const url = `http://localhost:80/api/conversations/${1}/messages?limit=${20}&after=${20}`;

    const req = new Request(url, {
      headers: {
        Cookie,
      },
    });
    const res = await fetch(req);
    const data = await res.json();
    console.log("data: ", data);

    expect(res.status).toBe(200);
  });
});

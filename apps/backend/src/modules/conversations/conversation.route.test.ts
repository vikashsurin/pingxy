import { describe, expect, test } from "bun:test";

describe("Conversations Table Schema", () => {
  const cookieValue = "f39a2e95-83ce-4ffc-a848-4b9b53f9b7bb";
  const Cookie = `_Host-session=${cookieValue}`;
  const baseUrl = "http://localhost:80/api/conversations";

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

  test.only("GET  /api/conversations/temp", async () => {
    const url = `${baseUrl}/temp`;
    const req = new Request(url, {
      headers: {
        Cookie,
      },
    });
    const res = await fetch(req);
    const data = await res.json();
    console.log("data: ", data);

    expect(res.status).toBe(200);
  })
});

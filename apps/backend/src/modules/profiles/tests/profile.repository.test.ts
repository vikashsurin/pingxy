import { describe, it, expect } from "bun:test";
import { ProfileRepository } from "../profile.repository";
import { DB_TX } from "@lib/db/client";

describe("ProfileRepository", () => {
  it("should insert a profile", async () => {
    const profile = await ProfileRepository.insert({
      userId: 2,
      gender: 'male' as const,
      age: 25,
      country: "IN",
      bio: 'I am Venom'
    })
    console.log('profile', profile)
    expect(profile).toBeDefined();
  });

  it("should update a profile", async () => {
    const profile = await ProfileRepository.update(
      1,
      {
        gender: 'male' as const,
        age: 26,
        bio: "I am a new venom"
      },
    )
    console.log('profile', profile)
    expect(profile).toBeDefined();
  });

  it('should return a profile by id', async () => {
    const profile = await ProfileRepository.selectById(1)
    console.log('profile', profile)
    expect(profile).toBeDefined();
  });

  it('should return a profile by user id', async () => {
    const profile = await ProfileRepository.selectByUserId(2)
    console.log('profile', profile)
    expect(profile).toBeDefined();
  });

  it('should delete a profile by id', async () => {
    const result = await ProfileRepository.delete(1)
    console.log('result', result)
    expect(result).toBeDefined();
  });
});

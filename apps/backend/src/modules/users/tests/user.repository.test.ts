import { describe, it, expect } from 'bun:test'
import { UserRepository } from '../user.repository'


describe("UserRepository", () => {
  it('should insert a user', async () => {
    const user = await UserRepository.insert({
      userName: 'Venom',
      type: "user" as const,
      email: 'random@gmail.com',
      hashedPassword: '847509q84sfsdf',
    })
    console.log({ user })
    expect(user).toBeDefined()
  })
})

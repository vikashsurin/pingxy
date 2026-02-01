// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { PublicUser } from "@pingxy/shared/types";

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user: PublicUser | null;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};

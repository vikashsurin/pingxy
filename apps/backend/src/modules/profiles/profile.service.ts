import { ProfileRepository } from "./profile.repository";

export const ProfileService = {
  createProfile: async (userId: number,
    data: {
      gender?: string;
      age?: number;
      country?: string;
      bio?: string | null
    }) => {
    const existingProfile = await ProfileRepository.selectByUserId(userId);

    if (existingProfile) {
      return existingProfile;
    }

    const profile = {
      userId,
      ...data,
    };

    const profileData = await ProfileRepository.insert(profile);
    return profileData;
  },

  updateProfile: async (id: number, data: {
    gender?: string;
    age?: number;
    country?: string;
    bio?: string | null
  }) => {
    const existingProfile = await ProfileRepository.selectById(id);

    if (!existingProfile) {
      throw new Error('Profile not found');
    }

    const profile = await ProfileRepository.update(id, data);
    return profile;
  },

  deleteProfile: async (id: number) => {
    const profile = await ProfileRepository.delete(id);
    return profile;
  },
}

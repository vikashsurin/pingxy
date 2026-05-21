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


  getProfile: async (userId: number) => {
    const profile = await ProfileRepository.selectByUserId(userId);
    return profile;
  },

  updateProfile: async (userId: number, data: {
    gender?: string;
    age?: number;
    country?: string;
    bio?: string | null
  }) => {
    const existingProfile = await ProfileRepository.selectByUserId(userId);

    if (!existingProfile) {
      throw new Error('Profile not found');
    }

    const profile = await ProfileRepository.update(userId, data);
    return profile;
  },

  deleteProfile: async (userId: number) => {
    const profile = await ProfileRepository.delete(userId);
    return profile;
  },
}

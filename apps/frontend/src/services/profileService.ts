import { profileApi } from "../lib/api/profileApi";

function createProfileService() {
    const getProfile = async () => {
        const data = await profileApi.getProfile();
        return data;
    }
    const createProfile = async (profileData: any) => {
        const res = await profileApi.createProfile(profileData);
        return res.data;
    }
    const updateProfile = async (profileData: any) => {
        const res = await profileApi.updateProfile(profileData);
        return res.data;
    }
    const deleteProfile = async () => {
        const res = await profileApi.deleteProfile();
        return res.data;
    }


    return {
        getProfile,
        createProfile,
        updateProfile,
        deleteProfile,
    }
}

export const profileService = createProfileService()
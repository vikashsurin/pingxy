import queryClient from "@/src/lib/queryClient"
import { profileService } from "@/src/services/profileService"
import { useMutation, useQuery } from "@tanstack/react-query"

export const useProfile = () => {
    return useQuery({
        queryKey: ["profiles", 'me'],
        queryFn: async () => {
            return await profileService.getProfile();
        },
    })
}

export const useCreateProfile = () => {
    return useMutation({
        mutationFn: async (profileData: any) => {
            return await profileService.createProfile(profileData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["profile", 'me'],
            });
        }
    })
}


export const useUpdateProfile = () => {
    return useMutation({
        mutationFn: async (profileData: any) => {
            return await profileService.updateProfile(profileData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["profile", 'me'],
            });
        }
    })
}

export const useDeleteProfile = () => {
    return useMutation({
        mutationFn: async () => {
            return await profileService.deleteProfile();
        },
    })
}


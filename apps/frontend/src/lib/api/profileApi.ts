function createProfileApi() {
    const baseUrl = "http://localhost/api/profiles";

    const getProfile = async () => {

        const res = await fetch(`${baseUrl}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        if (!res.ok) {
            throw new Error("Failed to fetch profile");
        }

        return res.json();

    };

    const createProfile = async (profileData: any) => {
        const res = await fetch(`${baseUrl}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(profileData),
        });
        return res.json();
    };

    const updateProfile = async (profileData: any) => {
        const res = await fetch(`${baseUrl}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include',
            body: JSON.stringify(profileData),
        });

        return res.json();
    };


    const deleteProfile = async () => {
        const res = await fetch(`${baseUrl}/`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        return res.json();
    };

    return {
        createProfile,
        getProfile,
        updateProfile,
        deleteProfile,
    };
}

export const profileApi = createProfileApi();
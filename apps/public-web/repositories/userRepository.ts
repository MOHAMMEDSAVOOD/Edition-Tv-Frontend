import { apiClient, ApiError } from "@/lib/api-client";

export interface UserProfileData {
  userId: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  bio: string;
  subscriptionTier: string;
  renewalDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
}

export const userRepository = {
  async fetchUserProfile(): Promise<UserProfileData | null> {
    if (!apiClient.isAuthenticated()) {
      return null;
    }
    try {
      return await apiClient.get<UserProfileData>("/users/me/profile");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return null;
      }
      console.error("Failed to fetch user profile:", error);
      return null;
    }
  },

  async updateUserProfile(data: UpdateProfileRequest): Promise<UserProfileData | null> {
    if (!apiClient.isAuthenticated()) {
      return null;
    }
    try {
      return await apiClient.put<UserProfileData>("/users/me/profile", data);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return null;
      }
      console.error("Failed to update user profile:", error);
      return null;
    }
  },
};

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

export interface ForgotPasswordResponse {
  message: string;
}

export interface VerifyOtpResponse {
  valid: boolean;
  message: string;
  token?: string;
}

export interface MessageResponse {
  message: string;
}

export const userRepository = {
  async fetchUserProfile(): Promise<UserProfileData | null> {
    if (!apiClient.getAccessToken()) {
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
    if (!apiClient.getAccessToken()) {
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

  async forgotPassword(email: string): Promise<ForgotPasswordResponse | null> {
    try {
      return await apiClient.post<ForgotPasswordResponse>("/auth/forgot-password", { email });
    } catch (error) {
      console.error("Failed to request password reset:", error);
      return null;
    }
  },

  async verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse | null> {
    try {
      return await apiClient.post<VerifyOtpResponse>("/auth/verify-otp", { email, otp });
    } catch (error) {
      console.error("Failed to verify OTP code:", error);
      return null;
    }
  },

  async resetPassword(params: { token?: string; email?: string; otp?: string; newPassword: string }): Promise<MessageResponse | null> {
    try {
      return await apiClient.post<MessageResponse>("/auth/reset-password", params);
    } catch (error) {
      console.error("Failed to reset password:", error);
      return null;
    }
  },
};

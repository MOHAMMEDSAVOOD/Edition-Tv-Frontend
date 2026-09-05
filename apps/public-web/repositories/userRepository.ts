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
  message?: string;
  token?: string;
  resetToken?: string;
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

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    try {
      return await apiClient.post<ForgotPasswordResponse>("/auth/forgot-password", { email });
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.details?.detail || error.details?.title || error.message || "Failed to send reset OTP");
      }
      throw error;
    }
  },

  async verifyOtp(email: string, otpCode: string): Promise<VerifyOtpResponse> {
    try {
      const res = await apiClient.post<VerifyOtpResponse>("/auth/verify-otp", {
        email,
        otpCode,
        otp: otpCode,
      });
      return {
        valid: res.valid ?? true,
        message: res.message || "OTP verified successfully",
        token: res.token || res.resetToken,
        resetToken: res.resetToken || res.token,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.details?.detail || error.details?.title || error.message || "Invalid or expired OTP code");
      }
      throw error;
    }
  },

  async resetPassword(params: {
    email: string;
    otpCode: string;
    resetToken?: string;
    newPassword: string;
  }): Promise<MessageResponse> {
    try {
      return await apiClient.post<MessageResponse>("/auth/reset-password", {
        email: params.email,
        otpCode: params.otpCode,
        otp: params.otpCode,
        resetToken: params.resetToken,
        token: params.resetToken,
        newPassword: params.newPassword,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.details?.detail || error.details?.title || error.message || "Failed to reset password");
      }
      throw error;
    }
  },
};

import type { APISound, APISetting, APIUploadResponse } from "@/types/api";
import type { User } from "@auth0/auth0-react";

class ApiService {
  private baseUrl: string;
  private guildId: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL;
    this.guildId = import.meta.env.VITE_MOC_GUILD_ID;
  }

  private getUserId(user: User): string {
    return user.sub?.split("|")[2] || "";
  }

  private getAuthHeaders(token: string) {
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  async fetchSounds(user: User): Promise<APISound[]> {
    if (!user) throw new Error("User not authenticated");

    const response = await fetch(
      `${this.baseUrl}/sounds/${this.guildId}/${this.getUserId(user)}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch sounds");
    }

    const data = await response.json();
    return data.sounds;
  }

  async fetchSettings(user: User): Promise<APISetting> {
    if (!user) throw new Error("User not authenticated");

    const response = await fetch(
      `${this.baseUrl}/settings/${this.guildId}/${this.getUserId(user)}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch settings");
    }

    const data = await response.json();
    return data.setting;
  }

  async uploadSounds(
    user: User,
    token: string,
    files: File[]
  ): Promise<APIUploadResponse> {
    if (!user) throw new Error("User not authenticated");

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const response = await fetch(
      `${this.baseUrl}/sounds/${this.guildId}/${this.getUserId(user)}`,
      {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // for expected status codes, we want the response body
    if (![200, 207, 400].includes(response.status)) {
      throw new Error("Failed to upload sounds");
    }

    return response.json();
  }

  async updateSettings(
    user: User,
    token: string,
    updates: Partial<APISetting>
  ): Promise<void> {
    if (!user) throw new Error("User not authenticated");

    const response = await fetch(
      `${this.baseUrl}/settings/${this.guildId}/${this.getUserId(user)}`,
      {
        method: "PATCH",
        body: JSON.stringify(updates),
        headers: this.getAuthHeaders(token),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update settings");
    }
  }

  async deleteSound(soundId: string, token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/sound/${soundId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Failed to delete sound");
    }
  }

  async fetchSoundBlob(soundId: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/sound/${soundId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch audio");
    }

    return response.blob();
  }

  getSoundUrl(soundId: string): string {
    return `${this.baseUrl}/sound/${soundId}`;
  }
}

export const apiService = new ApiService();

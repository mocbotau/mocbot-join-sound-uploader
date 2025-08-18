import { useState, useEffect } from "react";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import type { Sound } from "@/types";
import type { APISetting, APISound, SuccessFile } from "@/types/api";
import type { User } from "@auth0/auth0-react";

const getUniqueFileName = (fileName: string, existingSounds: Sound[]) => {
  const existingNames = existingSounds.map((s) => s.name);
  if (!existingNames.includes(fileName)) {
    return fileName;
  }
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
  const extension = fileName.match(/\.[^/.]+$/)?.[0] || "";
  let counter = 1;
  let newName = `${nameWithoutExt} (${counter})${extension}`;

  while (existingNames.includes(newName)) {
    counter++;
    newName = `${nameWithoutExt} (${counter})${extension}`;
  }

  return newName;
};

const transformApiSoundToSound = (
  apiSound: APISound,
  settings?: APISetting
): Sound => ({
  id: apiSound.id,
  name: apiSound.original_name,
  url: apiService.getSoundUrl(apiSound.id),
  active: apiSound.id === settings?.active_sound_id,
});

const transformSuccessFileToSound = (
  successFile: SuccessFile,
  settings?: APISetting
): Sound => ({
  id: successFile.id,
  name: successFile.original_name,
  url: apiService.getSoundUrl(successFile.id),
  active: successFile.id === settings?.active_sound_id,
});

export const useSounds = (user: User | undefined, token: string | null) => {
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [settings, setSettings] = useState<APISetting | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    if (!user || !token) return;

    try {
      const timeout = setTimeout(
        () => toast.warning("Could not fetch join sounds"),
        10000
      );

      const [apiSounds, apiSettings] = await Promise.all([
        apiService.fetchSounds(user),
        apiService.fetchSettings(user),
      ]);

      clearTimeout(timeout);

      setSounds(apiSounds.map((s) => transformApiSoundToSound(s, apiSettings)));
      sortSounds();
      setSettings(apiSettings);
      setIsLoading(false);
    } catch (error) {
      toast.error("Failed to load join sounds");
      console.error(error);
      setIsLoading(false);
    }
  };

  const uploadSounds = async (files: File[]) => {
    if (!files.length || !user || !token) return;

    try {
      const processedFiles = files.map((file) => {
        const uniqueName = getUniqueFileName(file.name, sounds);
        if (uniqueName !== file.name) {
          return new File([file], uniqueName, { type: file.type });
        }
        return file;
      });

      const response = await apiService.uploadSounds(
        user,
        token,
        processedFiles
      );

      if (response.status !== "success") {
        response.failed_files.forEach((f) =>
          toast.warning(`Failed to upload ${f.filename}`, {
            description: f.error,
          })
        );
        toast.info(response.message);
      }

      const newSounds = response.successful_files.map((s) =>
        transformSuccessFileToSound(s, settings || undefined)
      );
      setSounds((prev) => [...prev, ...newSounds]);
      sortSounds();

      return response;
    } catch (error) {
      toast.error("Failed to upload sounds");
      console.error(error);
    }
  };

  const setActiveSound = async (soundId: string) => {
    if (!user || !token) return;

    try {
      await apiService.updateSettings(user, token, {
        active_sound_id: soundId,
      });

      const soundName = sounds.find((s) => s.id === soundId)?.name;
      toast.success("Successfully changed active sound", {
        description: `The active sound is now ${soundName}`,
      });

      setSounds((prev) =>
        prev.map((s) => ({ ...s, active: s.id === soundId }))
      );
      setSettings((prev) => ({ ...prev!, active_sound_id: soundId }));
    } catch (error) {
      toast.error("Failed to change active sound");
      console.error(error);
    }
  };

  const changeMode = async (newMode: "single" | "random") => {
    if (!user || !token) return;

    try {
      await apiService.updateSettings(user, token, { mode: newMode });
      toast.success(`Changed mode to ${newMode}`);
      setSettings((prev) => ({ ...prev!, mode: newMode }));
    } catch (error) {
      toast.error("Failed to change mode");
      console.error(error);
    }
  };

  const deleteSound = async (soundId: string) => {
    if (!token) return;

    try {
      await apiService.deleteSound(soundId, token);

      const soundName = sounds.find((s) => s.id === soundId)?.name;
      toast.success("Successfully deleted sound", {
        description: `${soundName} no longer exists`,
      });

      await loadData();
    } catch (error) {
      toast.error("Failed to delete sound");
      console.error(error);
    }
  };

  const sortSounds = () => {
    setSounds((prevSounds) =>
      [...prevSounds].sort((a, b) => a.name.localeCompare(b.name))
    );
  };

  useEffect(() => {
    if (user && token) {
      loadData();
    }
  }, [user, token]);

  useEffect(() => {
    if (sounds.length === 1 && !settings?.active_sound_id) {
      setActiveSound(sounds[0].id);
    }
  }, [sounds, settings]);

  return {
    sounds,
    settings,
    isLoading,
    uploadSounds,
    setActiveSound,
    changeMode,
    deleteSound,
    refreshData: loadData,
  };
};

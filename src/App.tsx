import { Button } from "@/ui/button";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/ui/shadcn-io/dropzone";
import { FaPlus, FaTrash } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import { SelectCard } from "@/components/SelectCard";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";

import "react-h5-audio-player/lib/styles.css";
import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/ui/alert";
import type { Sound } from "./types";
import type { APISetting, APISound, APIUploadResponse } from "./types/api";
import { toast } from "sonner";

const MAX_SOUNDS = 5;
const MAX_FILE_UPLOAD_SIZE = 10 * 1024 * 1024; // 10 MB

export default function App() {
  const { user, isAuthenticated, getAccessTokenSilently, getAccessTokenWithPopup } = useAuth0();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [sounds, setSounds] = useState<Sound[]>([]);
  const [settings, setSettings] = useState<APISetting | null>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [uploadVisible, setUploadVisible] = useState(false);
  const [files, _] = useState<File[] | undefined>();


  // API FUNCTIONS
  const fetchToken = async () => {
    let token;
    try {
      token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUDIENCE_URL,
        },
      });
    } catch (e: any) {
      if (e.error === "consent_required" || e.error === "login_required") {
        token = await getAccessTokenWithPopup({
          authorizationParams: {
            audience: import.meta.env.VITE_AUDIENCE_URL,
          },
        });
      } else {
        throw e;
      }
    }
    return token;
  };

  function fetchSounds(): Promise<APISound[]> {
    return new Promise((resolve, reject) => {
      if (!user) reject()
      fetch(`${import.meta.env.VITE_API_URL}/sounds/${import.meta.env.VITE_MOC_GUILD_ID}/${user?.sub?.split('|')[2]}`).then((r) => r.ok ? r.json() : Promise.reject(r)).then(o => resolve(o.sounds)).catch(e => reject(e))
    })
  }

  function fetchSettings(): Promise<APISetting> {
    return new Promise((resolve, reject) => {
      if (!user) reject()
      fetch(`${import.meta.env.VITE_API_URL}/settings/${import.meta.env.VITE_MOC_GUILD_ID}/${user?.sub?.split('|')[2]}`).then((r) => r.ok ? r.json() : Promise.reject(r)).then(o => resolve(o.setting)).catch(e => reject(e))
    })
  }

  // CLIENT HANDLERS

  const handleUpload = (files: File[]) => {
    if (!files || files.length === 0) return;
    const formData = new FormData();
    files.forEach(f => formData.append("files", f))
    fetch(`${import.meta.env.VITE_API_URL}/sounds/${import.meta.env.VITE_MOC_GUILD_ID}/${user?.sub?.split('|')[2]}`, { method: "POST", body: formData, headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).then((d: APIUploadResponse) => {
      if (d.status === "failure") {
        d.failed_files.forEach((f) => toast.warning(`Failed to upload ${f.filename}`, { description: f.error }))
        toast.info(d.message)
      }
      setSelectedFile(null);
      setUploadVisible(false);
      setSounds((prev) => [...prev, ...d.successful_files.map((s) => ({ id: s.id, name: s.original_name, url: `${import.meta.env.VITE_API_URL}/sound/${s.id}`, active: s.id === settings?.active_sound_id }))])
    }).catch((e) => toast.error(e))
  };

  const handleSetActive = (id: string) => {
    fetch(`${import.meta.env.VITE_API_URL}/settings/${import.meta.env.VITE_MOC_GUILD_ID}/${user?.sub?.split('|')[2]}`, { method: "PATCH", body: JSON.stringify({ active_sound_id: id }), headers: { Authorization: `Bearer ${token}` } }).then((r) => {
      if (r.ok) {
        toast.success("Successfully changed active sound", { description: `The active sound is now ${sounds.find(s => s.id === id)?.name}` })
        setSounds(sounds.map((s) => ({ ...s, active: s.id === id })));
        setSettings((prev) => ({ ...prev, active_sound_id: id } as APISetting))
      } else { Promise.reject(r.json()) }
    }).catch((e) => toast.error("Failed to change active sound", { description: e.error }))
  };

  const handleDelete = (id: string) => {
    fetch(`${import.meta.env.VITE_API_URL}/sound/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }).then((r) => {
      if (r.ok) {
        toast.success("Successfully deleted sound", { description: `${sounds.find(s => s.id === id)?.name} no longer exists` })
        Promise.all([
          fetchSounds(),
          fetchSettings()
        ]).then(([sounds, settings]) => {
          setSounds(sounds.map((s) => ({ id: s.id, name: s.original_name, url: `${import.meta.env.VITE_API_URL}/sound/${s.id}`, active: s.id === settings.active_sound_id })))
          setSettings(settings)
        })
      }
      else {
        Promise.reject(r.json())
      }
    }).catch((e) => toast.error(e.error))
  };

  const handleModeChange = (newMode: "single" | "random") => {
    fetch(`${import.meta.env.VITE_API_URL}/settings/${import.meta.env.VITE_MOC_GUILD_ID}/${user?.sub?.split('|')[2]}`, { method: "PATCH", body: JSON.stringify({ mode: newMode }), headers: { Authorization: `Bearer ${token}` } }).then((r) => r.ok ? toast.success(`Changed mode to ${newMode}`) : Promise.reject(r.json())).catch((e) => toast.error(e.error));
    setSettings((prev) => ({ ...prev, mode: newMode } as APISetting));
  };

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return
    }
    const timeout = setTimeout(() => toast.warning("Could not fetch join sounds"), 10000)
    fetchToken().then((t) => { setToken(t as string) })
    Promise.all([
      fetchSounds(),
      fetchSettings()
    ]).then(([sounds, settings]) => {
      clearTimeout(timeout)
      setSounds(sounds.map((s) => ({ id: s.id, name: s.original_name, url: `${import.meta.env.VITE_API_URL}/sound/${s.id}`, active: s.id === settings.active_sound_id })))
      setSettings(settings)
      setIsLoading(false)
    })
  }, [user])

  useEffect(() => {
    if (sounds.length === 1 && !settings?.active_sound_id) {
      handleSetActive(sounds[0].id)
    }
  }, [sounds])

  return (
    <>
      <Navbar />
      <Toaster />
      <div className="mt-16 p-5 max-w-4xl mx-auto w-full font-serif">
        {isAuthenticated && (
          <>
            <h1 className="text-4xl mb-6 font-sans">
              Hi, <span className="text-primary">{user?.name}!</span>
            </h1>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-2xl font-sans">
                  My Join Sounds
                </CardTitle>
                <div className="flex flex-col md:flex-row gap-2 mt-2">
                  <SelectCard
                    title="Single"
                    description="Select a single join sound to play upon entering a voice call."
                    isActive={settings?.mode === "single" || sounds.length <= 1}
                    onSelect={() => {
                      handleModeChange("single");
                    }}
                    className="flex-1"
                  />
                  <SelectCard
                    title="Random"
                    description="Randomly selects one of the join sounds to play upon entering a voice call. Only available with multiple sounds."
                    disabled={sounds.length <= 1}
                    isActive={settings?.mode === "random" && sounds.length > 1}
                    onSelect={() => {
                      handleModeChange("random");
                    }}
                    className="flex-1"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="transition-all duration-500 overflow-hidden mb-4"
                  style={{
                    maxHeight: sounds.length >= MAX_SOUNDS ? "120px" : "0px",
                    opacity: sounds.length >= MAX_SOUNDS ? 1 : 0,
                    marginBottom:
                      sounds.length >= MAX_SOUNDS ? "16px" : "0px",
                  }}
                >
                  <Alert variant="default">
                    <AlertCircleIcon />
                    <AlertTitle>Heads up!</AlertTitle>
                    <AlertDescription>
                      You can only add up to {MAX_SOUNDS} join sounds. Remove
                      any existing sounds to upload new ones.
                    </AlertDescription>
                  </Alert>
                </div>
                <div
                  className="transition-all duration-500 overflow-hidden mb-4"
                  style={{
                    maxHeight: !isLoading && sounds.length > 0 && settings?.mode === "single" && !settings?.active_sound_id ? "120px" : "0px",
                    opacity: !isLoading && sounds.length > 0 && settings?.mode === "single" && !settings?.active_sound_id ? 1 : 0,
                    marginBottom:
                      !isLoading && sounds.length > 0 && settings?.mode === "single" && !settings?.active_sound_id ? "16px" : "0px",
                  }}
                >
                  <Alert variant="default">
                    <AlertCircleIcon />
                    <AlertTitle>Heads up!</AlertTitle>
                    <AlertDescription>
                      You currently do not have an active sound. Click on a sound to activate it!
                    </AlertDescription>
                  </Alert>
                </div>
                {isLoading ? <div className="space-y-4">
                  <Skeleton className="h-6 w-[80%] rounded-full" />
                  <Skeleton className="h-6 w-[80%] rounded-full" />
                  <Skeleton className="h-6 w-[80%] rounded-full" />
                </div> : (
                  <div
                      className="mb-4 transition-all duration-700 [transition-timing-function:cubic-bezier(0.25, 0.8, 0.25, 1)] overflow-hidden"
                      style={{
                        maxHeight:
                          sounds.length === 0
                            ? "80px"
                            : `${Math.min(sounds.length * 60 + 20, 400)}px`,
                        opacity: 1,
                      }}
                    >
                      {sounds.length === 0 ? (
                        <div className="text-gray-300 py-4">
                          No join sounds uploaded yet.
                        </div>
                      ) : (
                        <ul className="space-y-3">
                            {sounds.map((sound) => (
                              <li
                                key={sound.id}
                                className="flex flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full justify-between transition-all duration-500 ease-in-out"
                              >
                                <span
                                  className={`${sound.active && settings?.mode === "single"
                                    ? "font-bold"
                                    : "text-gray-500"
                                    } ${settings?.mode === "single"
                                      ? "hover:text-primary transition duration-150 ease-in-out cursor-pointer"
                                      : "text-white font-bold"
                                    }`}
                                  onClick={() => handleSetActive(sound.id)}
                                >
                                  {sound.name}
                                  {sound.active && settings?.mode === "single" && (
                                    <span className="ml-2 text-primary font-sans">
                                      (Active)
                                    </span>
                                  )}
                                </span>
                                <ConfirmDialog
                                  dialogTrigger={
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="hover:text-primary"
                                    >
                                      <FaTrash />
                                    </Button>
                                  }
                                  onConfirm={() => handleDelete(sound.id)}
                                  toDelete={sound.name}
                                />
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                )}

                {!isLoading && !uploadVisible && sounds.length < MAX_SOUNDS && (
                  <div className="flex justify-center transition-all duration-500 ease-in-out">
                    <Button
                      variant="outline"
                      className="hover:text-primary transition-all duration-200"
                      onClick={() => setUploadVisible(true)}
                    >
                      <FaPlus /> Upload New Sound
                    </Button>
                  </div>
                )}

                <div
                  className={`transition-all duration-700 [transition-timing-function:cubic-bezier(0.25, 0.8, 0.25, 1)] overflow-hidden ${
                    uploadVisible ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full">
                    <Dropzone
                      accept={{ "audio/*": [] }}
                      maxFiles={MAX_SOUNDS}
                      maxSize={MAX_FILE_UPLOAD_SIZE}
                      onDrop={handleUpload}
                      onError={(err) => toast.error(err.message)}
                      src={files}
                    >
                      <DropzoneEmptyState /> <DropzoneContent />
                    </Dropzone>
                  </div>
                  {selectedFile && (
                    <div className="mt-2 text-sm">
                      Selected: {selectedFile.name}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
}

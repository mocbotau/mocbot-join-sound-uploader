import { Button } from "@/ui/button";
import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
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

import "react-h5-audio-player/lib/styles.css";
import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/ui/alert";

const MAX_SOUNDS = 5;
const MAX_FILE_UPLOAD_SIZE = 10 * 1024 * 1024; // 10 MB

export default function App() {
  const stubSounds = [
    { id: "1", name: "wo cao", url: "", active: true },
    { id: "2", name: "bruh", url: "", active: false },
  ];

  const stubOtherUsers = [
    {
      id: "456",
      username: "OtherUser",
      sounds: [{ id: "3", name: "meow", url: "", active: true }],
    },
  ];

  const { user, isAuthenticated } = useAuth0();
  const [mySounds, setMySounds] = useState(stubSounds);
  const [otherUsers] = useState(stubOtherUsers);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"single" | "random">(
    mySounds.length > 1 ? "single" : "single"
  );

  const [uploadVisible, setUploadVisible] = useState(false);

  const [files, setFiles] = useState<File[] | undefined>();

  const handleUpload = (files: File[]) => {
    if (!files || files.length === 0) return;
    setMySounds((prev) => {
      // we set the newest uploaded file to be the active one
      const allInactive = prev.map((s) => ({ ...s, active: false }));

      const updated = [
        ...allInactive,
        ...files.map((file) => ({
          id: Math.random().toString(),
          name: file.name,
          url: "",
          active: true,
        })),
      ];

      if (updated.length > 1 && mode === "single") setMode("single");
      if (updated.length === 1) setMode("single");

      return updated;
    });
    setSelectedFile(null);
    setUploadVisible(false);
  };

  const handleSetActive = (id: string) => {
    setMySounds(mySounds.map((s) => ({ ...s, active: s.id === id })));
  };

  const handleDelete = (id: string) => {
    setMySounds((prev) => {
      const removeFile = prev.find((s) => s.id === id);
      const updated = prev.filter((s) => s.id !== id);

      if (removeFile?.active && updated.length > 0) {
        updated[0].active = true; // if deleted sound was active, set first to active instead
      }

      if (updated.length <= 1) setMode("single");
      return updated;
    });
  };

  const handleModeChange = (newMode: "single" | "random") => {
    setMode(newMode);
    if (newMode === "random") {
      setMySounds(mySounds.map((s) => ({ ...s, active: false })));
    } else {
      if (!mySounds.some((s) => s.active) && mySounds.length > 0) {
        setMySounds(mySounds.map((s, i) => ({ ...s, active: i === 0 })));
      }
    }
  };

  return (
    <>
      <Navbar />
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
                    isActive={mode === "single" || mySounds.length <= 1}
                    onSelect={() => {
                      handleModeChange("single");
                    }}
                    className="flex-1"
                  />
                  <SelectCard
                    title="Random"
                    description="Randomly selects one of the join sounds to play upon entering a voice call. Only available with multiple sounds."
                    disabled={mySounds.length <= 1}
                    isActive={mode === "random" && mySounds.length > 1}
                    onSelect={() => {
                      handleModeChange("random");
                    }}
                    className="flex-1"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="mb-4 transition-all duration-700 [transition-timing-function:cubic-bezier(0.25, 0.8, 0.25, 1)] overflow-hidden"
                  style={{
                    maxHeight:
                      mySounds.length === 0
                        ? "80px"
                        : `${Math.min(mySounds.length * 60 + 20, 400)}px`,
                    opacity: 1,
                  }}
                >
                  {mySounds.length === 0 ? (
                    <div className="text-gray-300 py-4">
                      No join sounds uploaded yet.
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {mySounds.map((sound) => (
                        <li
                          key={sound.id}
                          className="flex flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full justify-between transition-all duration-500 ease-in-out"
                        >
                          <span
                            className={`${
                              sound.active && mode === "single"
                                ? "font-bold"
                                : "text-gray-500"
                            } ${
                              mode === "single"
                                ? "hover:text-primary transition duration-150 ease-in-out cursor-pointer"
                                : "text-white font-bold"
                            }`}
                            onClick={() => handleSetActive(sound.id)}
                          >
                            {sound.name}
                            {sound.active && mode === "single" && (
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

                {!uploadVisible && mySounds.length < MAX_SOUNDS && (
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
                  className="transition-all duration-500 overflow-hidden mb-4"
                  style={{
                    maxHeight: mySounds.length >= MAX_SOUNDS ? "120px" : "0px",
                    opacity: mySounds.length >= MAX_SOUNDS ? 1 : 0,
                    marginBottom:
                      mySounds.length >= MAX_SOUNDS ? "16px" : "0px",
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
                  className={`transition-all duration-700 [transition-timing-function:cubic-bezier(0.25, 0.8, 0.25, 1)] overflow-hidden ${
                    uploadVisible ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full">
                    <Dropzone
                      accept={{ "audio/*": [] }}
                      maxFiles={1}
                      maxSize={MAX_FILE_UPLOAD_SIZE}
                      onDrop={handleUpload}
                      onError={console.error}
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

            <Card>
              <CardHeader>
                <CardTitle>Browse Join Sounds</CardTitle>
              </CardHeader>
              <CardContent>
                {otherUsers.length === 0 ? (
                  <div>No other users found.</div>
                ) : (
                  <ul className="space-y-6">
                    {otherUsers.map((u) => (
                      <li key={u.id}>
                        <div className="font-bold mb-2">{u.username}</div>
                        <ul className="space-y-2 ml-2 sm:ml-4">
                          {u.sounds.map((sound) => (
                            <li
                              key={sound.id}
                              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3"
                            >
                              <span>{sound.name}</span>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="w-full sm:w-auto"
                              >
                                Play
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
}

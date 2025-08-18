import { Button } from "@/ui/button";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/ui/shadcn-io/dropzone";
import { FaPlus } from "react-icons/fa";
import { toast } from "sonner";

const MAX_FILE_UPLOAD_SIZE = 10 * 1024 * 1024; // 10 MB

interface UploadSectionProps {
  uploadVisible: boolean;
  maxSounds: number;
  onToggleUpload: (visible: boolean) => void;
  onUpload: (files: File[]) => void;
  selectedFile: File | null;
}

export const UploadSection = ({
  uploadVisible,
  maxSounds,
  onToggleUpload,
  onUpload,
  selectedFile,
}: UploadSectionProps) => {
  return (
    <>
      {!uploadVisible && (
        <div className="flex justify-center transition-all duration-500 ease-in-out">
          <Button
            variant="outline"
            className="hover:text-primary transition-all duration-200"
            onClick={() => onToggleUpload(true)}
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
            maxFiles={maxSounds}
            maxSize={MAX_FILE_UPLOAD_SIZE}
            onDrop={(files) => {
              onUpload(files);
              onToggleUpload(false);
            }}
            onError={(err) => toast.error(err.message)}
          >
            <DropzoneEmptyState />
            <DropzoneContent />
          </Dropzone>
        </div>
        {selectedFile && (
          <div className="mt-2 text-sm">Selected: {selectedFile.name}</div>
        )}
      </div>
    </>
  );
};

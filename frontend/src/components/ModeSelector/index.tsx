import { SelectCard } from "@/components/SelectCard";
import type { APISetting } from "@/types/api";

interface ModeSelectorProps {
  settings: APISetting | null;
  soundCount: number;
  onModeChange: (mode: "single" | "random") => void;
}

export const ModeSelector = ({
  settings,
  soundCount,
  onModeChange,
}: ModeSelectorProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-2 mt-2">
      <SelectCard
        title="Single"
        description="Select a single join sound to play upon entering a voice call."
        isActive={settings?.mode === "single" || soundCount <= 1}
        onSelect={() => {
          if (settings?.mode !== "single") {
            onModeChange("single");
          }
        }}
        className="flex-1"
      />
      <SelectCard
        title="Random"
        description="Randomly selects one of the join sounds to play upon entering a voice call. Only available with multiple sounds."
        disabled={soundCount <= 1}
        isActive={settings?.mode === "random" && soundCount > 1}
        onSelect={() => {
          if (settings?.mode !== "random") {
            onModeChange("random");
          }
        }}
        className="flex-1"
      />
    </div>
  );
};

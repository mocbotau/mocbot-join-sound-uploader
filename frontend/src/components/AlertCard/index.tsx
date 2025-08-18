import { Alert, AlertTitle, AlertDescription } from "@/ui/alert";
import { AlertCircleIcon } from "lucide-react";

interface AlertCardProps {
  show: boolean;
  title: string;
  description: string;
  variant?: "default" | "destructive";
}

export const AlertCard = ({
  show,
  title,
  description,
  variant = "default",
}: AlertCardProps) => {
  return (
    <div
      className="transition-all duration-500 overflow-hidden mb-4"
      style={{
        maxHeight: show ? "120px" : "0px",
        opacity: show ? 1 : 0,
        marginBottom: show ? "16px" : "0px",
      }}
    >
      <Alert variant={variant}>
        <AlertCircleIcon />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
    </div>
  );
};

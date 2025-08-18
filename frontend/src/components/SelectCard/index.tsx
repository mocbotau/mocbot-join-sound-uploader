import { Card } from "@/ui/card";

interface SelectCardProps {
  title: string;
  description: string;
  isActive: boolean;
  onSelect: () => void;
  className?: string;
  disabled?: boolean;
  props?: React.HTMLAttributes<HTMLDivElement>;
}

export function SelectCard({
  title,
  description,
  onSelect,
  isActive,
  className,
  disabled,
  ...props
}: SelectCardProps) {
  const selectWithDisable = () => {
    if (disabled) return;
    onSelect();
  };

  return (
    <Card
      onClick={selectWithDisable}
      className={`cursor-pointer transition-colors p-4 shadow-xl rounded-md ${
        isActive ? "outline outline-1 outline-primary" : ""
      } ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-muted"
      } ${className}`}
      {...props}
    >
      <h3 className="text-2xl font-sans">{title}</h3>
      <p className="text-md">{description}</p>
    </Card>
  );
}

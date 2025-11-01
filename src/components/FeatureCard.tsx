import { LucideIcon } from "lucide-react";
import { Card } from "./ui/card";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <Card className="p-6 hover-lift border-border bg-card">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="p-3 rounded-xl bg-primary/10">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </Card>
  );
};

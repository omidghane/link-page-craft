import { Card } from "./ui/card";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
}

export const StatsCard = ({ title, value, subtitle }: StatsCardProps) => {
  return (
    <Card className="p-6 hover-lift border-border">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold text-primary">{value}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </Card>
  );
};

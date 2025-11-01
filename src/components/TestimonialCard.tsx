import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  avatar?: string;
}

export const TestimonialCard = ({ name, role, content, avatar }: TestimonialCardProps) => {
  return (
    <Card className="p-6 hover-lift">
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground leading-relaxed">{content}</p>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={avatar} />
            <AvatarFallback>{name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{name}</p>
            <p className="text-sm text-muted-foreground">{role}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

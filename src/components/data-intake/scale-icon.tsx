import { Angry, Frown, Laugh, LucideIcon, Meh, Smile } from 'lucide-react';

interface ScaleIconProps {
  scaleRating: number;
}

function ScaleIcon({ scaleRating }: ScaleIconProps) {
  const ICON_MAP: Record<number, LucideIcon> = {
    1: Angry,
    2: Frown,
    3: Meh,
    4: Smile,
    5: Laugh,
  };

  const IconComponent = ICON_MAP[scaleRating];
  return <IconComponent className="h-5 w-5" />;
}

export default ScaleIcon;

import { useState, useRef, ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeToDeleteProps {
  onDelete: () => void;
  children: ReactNode;
}

const SwipeToDelete = ({ onDelete, children }: SwipeToDeleteProps) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const startX = useRef(0);
  const isDragging = useRef(false);

  const deleteThreshold = -80;

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    
    // Only allow swiping left
    if (diff < 0) {
      setTranslateX(Math.max(diff, -100));
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    
    if (translateX <= deleteThreshold) {
      setIsDeleting(true);
      setTimeout(() => {
        onDelete();
      }, 200);
    } else {
      setTranslateX(0);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Delete Background */}
      <div className="absolute inset-y-0 right-0 w-24 bg-destructive flex items-center justify-center">
        <Trash2 size={24} className="text-destructive-foreground" />
      </div>

      {/* Content */}
      <div
        className={cn(
          "relative bg-card transition-transform",
          isDeleting && "translate-x-full opacity-0"
        )}
        style={{ transform: isDeleting ? undefined : `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeToDelete;

import { cn } from "@/lib/utils";

interface CarouselDotsProps {
  totalSlides: number;
  currentSlide: number;
  onDotClick: (index: number) => void;
}

export const CarouselDots = ({ totalSlides, currentSlide, onDotClick }: CarouselDotsProps) => {
  return (
    <div className="flex justify-center gap-2 mt-6">
      {Array.from({ length: totalSlides }, (_, index) => (
        <button
          key={index}
          onClick={() => onDotClick(index)}
          className={cn(
            "w-2 h-2 rounded-full transition-all duration-300",
            index === currentSlide
              ? "bg-primary scale-125"
              : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
          )}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
};
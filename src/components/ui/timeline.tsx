import * as React from "react";
import { cn } from "@/lib/utils";

const Timeline = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn("flex flex-col space-y-8 relative border-l-2 border-navy/10 ml-3", className)} 
      {...props} 
    />
  )
);
Timeline.displayName = "Timeline";

interface TimelineEventProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  time: string;
}

const TimelineEvent = React.forwardRef<HTMLDivElement, TimelineEventProps>(
  ({ className, title, time, children, ...props }, ref) => (
    <div ref={ref} className={cn("relative pl-6", className)} {...props}>
      {/* Le point sur la ligne */}
      <div className="absolute w-3 h-3 bg-white border-2 border-gold rounded-full -left-[7px] top-1.5" />
      
      {/* En-tête de l'événement */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-sm font-black text-navy">{title}</span>
        <span className="text-xs font-bold text-navy/40">{time}</span>
      </div>
      
      {/* Contenu (Note, Email, Appel...) */}
      <div>{children}</div>
    </div>
  )
);
TimelineEvent.displayName = "TimelineEvent";

export { Timeline, TimelineEvent };
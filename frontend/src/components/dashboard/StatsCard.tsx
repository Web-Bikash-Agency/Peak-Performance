import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
  onClick?: () => void;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'default',
  onClick,
}: StatsCardProps) {
  const variantStyles = {
    default: "border-border",
    primary: "border-primary/20 bg-gradient-primary",
    success: "border-accent/20 bg-gradient-success",
    warning: "border-warning/20 bg-warning/10",
    destructive: "border-destructive/20 bg-destructive/10"
  };

  const iconStyles = {
    default: "text-muted-foreground",
    primary: "text-primary-foreground",
    success: "text-accent-foreground",
    warning: "text-warning",
    destructive: "text-destructive"
  };

  const textStyles = {
    default: "text-foreground",
    primary: "text-primary-foreground",
    success: "text-accent-foreground",
    warning: "text-foreground",
    destructive: "text-foreground"
  };

  return (
    <Card
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : -1}
      className={cn(
        "transition-all duration-300 hover:shadow-lg animate-fade-in",
        variantStyles[variant],
        onClick && "cursor-pointer hover:scale-[1.02]" // ✅ make clickable
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn("text-sm font-medium", textStyles[variant])}>
          {title}
        </CardTitle>
        <Icon className={cn("h-4 w-4", iconStyles[variant])} />
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", textStyles[variant])}>
          {value.toLocaleString()}
        </div>
        {trend && (
          <p
            className={cn(
              "text-xs mt-1",
              variant === "primary" || variant === "success"
                ? "text-primary-foreground/80"
                : "text-muted-foreground"
            )}
          >
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

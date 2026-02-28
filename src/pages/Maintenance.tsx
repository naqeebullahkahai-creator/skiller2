import { useState, useEffect } from "react";
import { Wrench, Mail, RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMaintenanceMode } from "@/hooks/useMaintenanceMode";

const CountdownTimer = ({ endTime }: { endTime: string }) => {
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setRemaining({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span>Estimated time remaining</span>
      </div>
      <div className="flex items-center justify-center gap-3">
        {[
          { value: remaining.days, label: "Days" },
          { value: remaining.hours, label: "Hours" },
          { value: remaining.minutes, label: "Min" },
          { value: remaining.seconds, label: "Sec" },
        ].map((unit) => (
          <div key={unit.label} className="text-center">
            <div className="bg-primary/10 text-primary text-2xl font-bold rounded-xl w-16 h-16 flex items-center justify-center tabular-nums">
              {pad(unit.value)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{unit.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Maintenance = () => {
  const { maintenanceConfig } = useMaintenanceMode();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* FANZON Logo */}
        <div className="flex justify-center">
          <div className="bg-primary text-primary-foreground px-8 py-4 rounded-xl shadow-lg">
            <span className="text-4xl font-bold tracking-tight">FANZON</span>
          </div>
        </div>

        {/* Maintenance Icon */}
        <div className="flex justify-center">
          <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center">
            <Wrench className="w-14 h-14 text-primary animate-pulse" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            We'll Be Back Shortly!
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {maintenanceConfig.message}
          </p>
        </div>

        {/* Countdown Timer */}
        {maintenanceConfig.endTime && maintenanceConfig.endTime.length > 0 && (
          <CountdownTimer endTime={maintenanceConfig.endTime} />
        )}

        {/* Refresh Button */}
        <Button onClick={handleRefresh} variant="outline" size="lg" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Check Again
        </Button>

        {/* Contact */}
        <div className="space-y-3 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Need urgent assistance? Contact us:
          </p>
          <Button variant="ghost" asChild>
            <a href="mailto:support@fanzon.pk" className="inline-flex items-center gap-2">
              <Mail className="w-4 h-4" />
              support@fanzon.pk
            </a>
          </Button>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground pt-4">
          Thank you for your patience. We're making FANZON even better for you!
        </p>
      </div>
    </div>
  );
};

export default Maintenance;

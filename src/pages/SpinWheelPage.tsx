import { useState, useRef, useEffect } from "react";
import { useSpinWheel } from "@/hooks/useSpinWheel";
import { useCoins } from "@/hooks/useCoins";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Gift, Trophy } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";

const SpinWheelPage = () => {
  const { user } = useAuth();
  const { segments, spin, isSpinning, todaySpins, lastResult } = useSpinWheel();
  const { balance } = useCoins();
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const segmentAngle = segments.length > 0 ? 360 / segments.length : 45;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || segments.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;

    ctx.clearRect(0, 0, size, size);

    segments.forEach((seg, i) => {
      const startAngle = (i * segmentAngle - 90) * (Math.PI / 180);
      const endAngle = ((i + 1) * segmentAngle - 90) * (Math.PI / 180);

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.fillStyle = seg.color || "#F85606";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + (endAngle - startAngle) / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText(seg.label, radius - 15, 5);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(center, center, 25, 0, Math.PI * 2);
    ctx.fillStyle = "#F85606";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SPIN", center, center + 5);
  }, [segments, segmentAngle]);

  const handleSpin = async () => {
    if (!user) return;
    setShowResult(false);
    
    const result = await spin();
    if (!result) return;

    const resultIndex = segments.findIndex(s => s.id === result.id);
    const targetAngle = 360 - (resultIndex * segmentAngle + segmentAngle / 2);
    const spins = 5;
    const newRotation = rotation + spins * 360 + targetAngle;
    setRotation(newRotation);

    setTimeout(() => setShowResult(true), 4000);
  };

  return (
    <>
      <SEOHead title="Spin & Win - FANZON" description="Spin the wheel to win coins, vouchers and more!" url="/spin-wheel" />
      <div className="min-h-screen bg-secondary flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">🎡 Spin & Win!</h1>
            <p className="text-muted-foreground">Spin the wheel daily to win coins, vouchers & more</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Wheel */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
                  <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-primary" />
                </div>
                <div
                  style={{ transform: `rotate(${rotation}deg)`, transition: isSpinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none" }}
                >
                  <canvas ref={canvasRef} width={300} height={300} className="rounded-full shadow-2xl" />
                </div>
              </div>

              <Button
                onClick={handleSpin}
                disabled={isSpinning || !user || todaySpins >= 1}
                className="mt-6 bg-primary hover:bg-primary/90 text-lg px-8 py-3 h-auto"
              >
                {!user ? "Login to Spin" : todaySpins >= 1 ? "Come Back Tomorrow!" : isSpinning ? "Spinning..." : "🎰 SPIN NOW!"}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">Spins today: {todaySpins}/1</p>
            </div>

            {/* Info & Result */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="text-primary" size={20} />
                    Your Coins
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">{balance}</p>
                </CardContent>
              </Card>

              {showResult && lastResult && (
                <Card className="border-primary bg-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="text-primary" size={20} />
                      You Won!
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-center">
                      {lastResult.reward_type === "nothing" ? "😅 Better luck next time!" : `🎉 ${lastResult.label}`}
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="text-primary" size={20} />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>• 1 free spin every day</p>
                  <p>• Win coins, discount vouchers, or free shipping</p>
                  <p>• Coins can be redeemed at checkout</p>
                  <p>• Premium members get 2x coins!</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default SpinWheelPage;

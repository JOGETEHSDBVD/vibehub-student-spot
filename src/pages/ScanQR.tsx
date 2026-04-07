import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle2, XCircle, AlertTriangle, Camera, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type ScanResult = {
  status: "valid" | "alreadyUsed" | "invalid";
  userName?: string;
  avatarUrl?: string;
  usedAt?: string;
  message: string;
};

const ScanQR = () => {
  const { isAdmin, loading } = useAdminCheck();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !authLoading && (!user || !isAdmin)) navigate("/");
  }, [isAdmin, loading, authLoading, user, navigate]);

  const processTicket = useCallback(async (ticketId: string) => {
    if (processing) return;
    setProcessing(true);

    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/checkin?ticketId=${ticketId}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });
      const res = await response.json();

      if (res.valid) {
        setResult({
          status: "valid",
          userName: res.userName,
          avatarUrl: res.avatarUrl,
          message: "Check-in successful!",
        });
      } else if (res.alreadyUsed) {
        setResult({
          status: "alreadyUsed",
          userName: res.userName,
          usedAt: res.usedAt,
          message: "This ticket has already been used",
        });
      } else {
        setResult({
          status: "invalid",
          message: res.error || "Invalid ticket",
        });
      }
    } catch {
      setResult({
        status: "invalid",
        message: "Failed to verify ticket",
      });
    } finally {
      setProcessing(false);
    }
  }, [processing]);

  const startScanning = useCallback(async () => {
    setResult(null);
    setScanning(true);

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Extract ticketId from URL like /checkin/xxx or just the raw ID
          let ticketId = decodedText;
          const match = decodedText.match(/\/checkin\/([a-f0-9-]+)/i);
          if (match) ticketId = match[1];

          scanner.stop().catch(() => {});
          setScanning(false);
          processTicket(ticketId);
        },
        () => {} // ignore scan failures
      );
    } catch (err) {
      setScanning(false);
      setResult({
        status: "invalid",
        message: "Could not access camera. Please allow camera permissions.",
      });
    }
  }, [processTicket]);

  const stopScanning = useCallback(() => {
    scannerRef.current?.stop().catch(() => {});
    scannerRef.current = null;
    setScanning(false);
  }, []);

  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  if (loading || authLoading) return <div className="flex h-screen items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!isAdmin) return null;

  return (
    <div className="flex h-screen bg-muted/30">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/events")} className="mb-4 gap-2">
            <ArrowLeft size={16} /> Back to Events
          </Button>
          <h1 className="text-2xl font-bold text-foreground">QR Check-in Scanner</h1>
          <p className="text-sm text-muted-foreground">Scan participant QR codes to check them in</p>
        </div>

        <div className="max-w-md mx-auto space-y-6">
          {/* Scanner area */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div id="qr-reader" ref={containerRef} className={scanning ? "block" : "hidden"} />

            {!scanning && !result && !processing && (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Camera size={36} className="text-primary" />
                </div>
                <p className="text-sm text-muted-foreground text-center mb-6">
                  Point your camera at a participant's QR code to check them in
                </p>
                <Button onClick={startScanning} className="gap-2 rounded-full px-8">
                  <Camera size={16} /> Start Scanning
                </Button>
              </div>
            )}

            {processing && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <p className="mt-4 text-sm text-muted-foreground">Verifying ticket...</p>
              </div>
            )}
          </div>

          {/* Result display */}
          {result && (
            <div className={`rounded-xl border-2 p-6 text-center space-y-3 ${
              result.status === "valid"
                ? "border-green-500 bg-green-500/10"
                : result.status === "alreadyUsed"
                ? "border-yellow-500 bg-yellow-500/10"
                : "border-destructive bg-destructive/10"
            }`}>
              {result.status === "valid" && (
                <CheckCircle2 size={48} className="mx-auto text-green-500" />
              )}
              {result.status === "alreadyUsed" && (
                <AlertTriangle size={48} className="mx-auto text-yellow-500" />
              )}
              {result.status === "invalid" && (
                <XCircle size={48} className="mx-auto text-destructive" />
              )}

              <h3 className={`text-xl font-bold ${
                result.status === "valid" ? "text-green-500"
                : result.status === "alreadyUsed" ? "text-yellow-500"
                : "text-destructive"
              }`}>
                {result.status === "valid" ? "VALID" : result.status === "alreadyUsed" ? "ALREADY USED" : "INVALID"}
              </h3>

              <p className="text-sm text-muted-foreground">{result.message}</p>

              {result.userName && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  {result.avatarUrl ? (
                    <img src={result.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {result.userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-semibold text-foreground">{result.userName}</span>
                </div>
              )}

              {result.usedAt && (
                <p className="text-xs text-muted-foreground">
                  Used at: {new Date(result.usedAt).toLocaleString()}
                </p>
              )}

              <Button
                onClick={() => { setResult(null); startScanning(); }}
                variant="outline"
                className="mt-4 rounded-full"
              >
                Scan Another
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ScanQR;

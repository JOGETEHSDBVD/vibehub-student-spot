import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle2, XCircle, AlertTriangle, ArrowLeft, QrCode } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useScannerCheck } from "@/hooks/useScannerCheck";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type ScanResult = {
  status: "valid" | "alreadyUsed" | "invalid";
  userName?: string;
  usedAt?: string;
  message: string;
};

const StaffScanner = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const { isScanner, loading: scannerLoading } = useScannerCheck();

  const [result, setResult] = useState<ScanResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const autoCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allLoading = authLoading || adminLoading || scannerLoading;
  const hasAccess = isAdmin || isScanner;

  // Access control
  useEffect(() => {
    if (allLoading) return;
    if (!user || !hasAccess) {
      toast({ title: "Access Denied", description: "You don't have permission to access the scanner.", variant: "destructive" });
      navigate("/", { replace: true });
    }
  }, [allLoading, user, hasAccess, navigate]);

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

      let scanResult: ScanResult;
      if (res.valid) {
        scanResult = { status: "valid", userName: res.userName, message: "Member Checked In" };
      } else if (res.alreadyUsed) {
        scanResult = { status: "alreadyUsed", userName: res.userName, usedAt: res.usedAt, message: "Already Checked In" };
      } else {
        scanResult = { status: "invalid", message: res.error || "Invalid Ticket" };
      }

      setResult(scanResult);

      // Auto-close after 2 seconds
      autoCloseTimer.current = setTimeout(() => {
        setResult(null);
        startScanning();
      }, 2000);
    } catch {
      setResult({ status: "invalid", message: "Failed to verify ticket" });
    } finally {
      setProcessing(false);
    }
  }, [processing]);

  const startScanning = useCallback(async () => {
    setResult(null);

    try {
      if (scannerRef.current) {
        try { await scannerRef.current.stop(); } catch {}
      }

      const scanner = new Html5Qrcode("staff-qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          let ticketId = decodedText;
          const match = decodedText.match(/\/checkin\/([a-f0-9-]+)/i);
          if (match) ticketId = match[1];

          scanner.stop().catch(() => {});
          processTicket(ticketId);
        },
        () => {}
      );

      setCameraStarted(true);
    } catch {
      toast({ title: "Camera Error", description: "Could not access camera. Please allow camera permissions.", variant: "destructive" });
    }
  }, [processTicket]);

  const dismissResult = useCallback(() => {
    if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current);
    setResult(null);
    startScanning();
  }, [startScanning]);

  // Start camera on mount
  useEffect(() => {
    if (!allLoading && hasAccess && !cameraStarted) {
      startScanning();
    }
  }, [allLoading, hasAccess, cameraStarted]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current);
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  if (allLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!hasAccess) return null;

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-sm">
        <button onClick={() => navigate(-1)} className="text-white flex items-center gap-2 text-sm font-medium">
          <ArrowLeft size={20} /> Back
        </button>
        <div className="flex items-center gap-2 text-white">
          <QrCode size={20} className="text-primary" />
          <span className="font-bold text-sm">QR Scanner</span>
        </div>
        <div className="w-16" />
      </div>

      {/* Camera view */}
      <div className="flex-1 relative">
        <div id="staff-qr-reader" className="absolute inset-0 [&_video]:!object-cover [&_video]:!w-full [&_video]:!h-full" />

        {/* Scanning frame overlay */}
        {!result && !processing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-64 h-64">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
              {/* Scanning line animation */}
              <div className="absolute left-2 right-2 h-0.5 bg-primary/80 animate-pulse" style={{ top: '50%' }} />
            </div>
            <p className="absolute bottom-8 text-white/70 text-sm font-medium">Align QR code within the frame</p>
          </div>
        )}

        {/* Processing spinner */}
        {processing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        )}

        {/* Result overlay modal */}
        {result && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-20"
            onClick={dismissResult}
          >
            <div
              className={`mx-6 w-full max-w-sm rounded-2xl p-8 text-center space-y-4 ${
                result.status === "valid"
                  ? "bg-green-950/90 border-2 border-green-500"
                  : result.status === "alreadyUsed"
                  ? "bg-yellow-950/90 border-2 border-yellow-500"
                  : "bg-red-950/90 border-2 border-red-500"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {result.status === "valid" && <CheckCircle2 size={56} className="mx-auto text-green-400" />}
              {result.status === "alreadyUsed" && <AlertTriangle size={56} className="mx-auto text-yellow-400" />}
              {result.status === "invalid" && <XCircle size={56} className="mx-auto text-red-400" />}

              <h2 className={`text-2xl font-bold ${
                result.status === "valid" ? "text-green-400"
                : result.status === "alreadyUsed" ? "text-yellow-400"
                : "text-red-400"
              }`}>
                {result.message}
              </h2>

              {result.userName && (
                <p className="text-white text-lg font-semibold">{result.userName}</p>
              )}

              {result.usedAt && (
                <p className="text-white/60 text-sm">
                  Used at: {new Date(result.usedAt).toLocaleString()}
                </p>
              )}

              <button
                onClick={dismissResult}
                className="mt-2 px-8 py-2.5 rounded-full bg-white/20 text-white text-sm font-medium hover:bg-white/30 transition-colors"
              >
                Scan Next
              </button>

              {/* Auto-close indicator */}
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full animate-shrink ${
                    result.status === "valid" ? "bg-green-400" : result.status === "alreadyUsed" ? "bg-yellow-400" : "bg-red-400"
                  }`}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffScanner;

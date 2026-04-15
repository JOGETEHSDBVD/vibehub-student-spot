import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useScannerCheck = () => {
  const { user, loading: authLoading } = useAuth();
  const [isScanner, setIsScanner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsScanner(false);
      setLoading(false);
      return;
    }

    const check = async () => {
      const { data, error } = await (supabase.rpc as any)("has_role", {
        _user_id: user.id,
        _role: "scanner",
      });
      setIsScanner(!error && data === true);
      setLoading(false);
    };
    check();
  }, [user, authLoading]);

  return { isScanner, loading };
};

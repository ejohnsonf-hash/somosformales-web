"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace("/login");
      } else {
        router.replace("/home");
      }

      setLoading(false);
    };

    checkSession();
  }, [router]);

  if (loading) {
    return <p style={{ padding: 40 }}>Cargando…</p>;
  }

  return null;
}

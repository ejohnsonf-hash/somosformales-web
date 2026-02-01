"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
        return;
      }

      setEmail(data.user.email ?? null);
    };

    loadUser();
  }, [router]);

  return (
    <div style={{ padding: 40 }}>
      <h1>Somos Formales</h1>
      <p>Bienvenido{email ? `, ${email}` : ""}</p>
      <p>Aquí irá la gestión de hogares.</p>
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";

export default function NewWorkerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const householdId = searchParams.get("household_id");

  const [fullName, setFullName] = useState("");
  const [dni, setDni] = useState("");
  const [loading, setLoading] = useState(false);

  // 1️⃣ Validación dura
  useEffect(() => {
    if (!householdId) {
      alert("Error: hogar no identificado");
      router.push("/households");
    }
  }, [householdId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!householdId) return;

    const confirm = window.confirm(
      "¿Confirmas que deseas crear esta trabajadora?\nLuego no podrá eliminarse, solo desactivarse."
    );

    if (!confirm) return;

    setLoading(true);

    // 2️⃣ INSERT correcto
    const { error } = await supabase.from("workers").insert({
      full_name: fullName,
      document_type: "DNI",
      document_number: dni,
      household_id: householdId,
    });

    if (error) {
      console.error("Supabase error:", error);
      alert("Error creando trabajadora");
      setLoading(false);
      return;
    }

    // 3️⃣ Volvemos al hogar
    router.push(`/households/${householdId}`);
  };

  return (
    <div style={{ padding: 40, maxWidth: 500 }}>
      <h1>Nueva trabajadora</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Nombre completo</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>DNI</label>
          <input
            type="text"
            required
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creando..." : "Crear trabajadora"}
        </button>
      </form>
    </div>
  );
}


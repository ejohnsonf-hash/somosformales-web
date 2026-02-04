"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function NewWorkerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const householdId = searchParams.get("household_id");

  const [fullName, setFullName] = useState("");
  const [documentType, setDocumentType] = useState("DNI");
  const [documentNumber, setDocumentNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔒 Seguridad básica: si no viene household_id, no seguimos
  useEffect(() => {
    if (!householdId) {
      alert("Falta el hogar. Regresando al inicio.");
      router.push("/home");
    }
  }, [householdId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!householdId) return;

    setLoading(true);

    const { error } = await supabase.from("workers").insert({
      full_name: fullName,
      document_type: documentType,
      document_number: documentNumber,
      birth_date: birthDate || null,
      household_id: householdId,
    });

    if (error) {
      alert("Error creando trabajadora");
      console.error(error);
      setLoading(false);
      return;
    }

    // ✅ Volvemos al hogar correcto
    router.push(`/households/${householdId}`);
  };

  return (
    <div style={{ padding: 40, maxWidth: 600 }}>
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
          <label>Tipo de documento</label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          >
            <option value="DNI">DNI</option>
            <option value="CE">CE</option>
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Número de documento</label>
          <input
            type="text"
            required
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label>Fecha de nacimiento (opcional)</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <button disabled={loading}>
          {loading ? "Guardando..." : "Crear trabajadora"}
        </button>
      </form>
    </div>
  );
}

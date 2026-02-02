"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function NewWorkerPage() {
  const router = useRouter();

  const [households, setHouseholds] = useState<any[]>([]);
  const [householdId, setHouseholdId] = useState("");

  const [documentType, setDocumentType] = useState("DNI");
  const [documentNumber, setDocumentNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const [loading, setLoading] = useState(false);

  /* ===========================
     CARGAR HOGARES DEL USUARIO
  ============================ */
  useEffect(() => {
    const loadHouseholds = async () => {
      const { data, error } = await supabase
        .from("households")
        .select("id, name");

      if (error) {
        console.error("Error cargando hogares:", error);
        alert("Error cargando hogares");
        return;
      }

      setHouseholds(data ?? []);
    };

    loadHouseholds();
  }, []);

  /* ===========================
     CREAR TRABAJADORA
  ============================ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("workers").insert({
      document_type: documentType,
      document_number: documentNumber,
      full_name: fullName,
      birth_date: birthDate || null,
      household_id: householdId,
    });

    if (error) {
      console.error("Error creando trabajadora:", error);
      alert("Error creando trabajadora");
      setLoading(false);
      return;
    }

    alert("Trabajadora creada correctamente");
    router.push("/workers");
  };

  /* ===========================
     UI
  ============================ */
  return (
    <div style={{ padding: 40, maxWidth: 480 }}>
      <h1>Nueva trabajadora</h1>

      <form onSubmit={handleSubmit}>
        <label>Hogar</label>
        <select
          required
          value={householdId}
          onChange={(e) => setHouseholdId(e.target.value)}
        >
          <option value="">Selecciona un hogar</option>
          {households.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>

        <br /><br />

        <label>Tipo de documento</label>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
        >
          <option value="DNI">DNI</option>
          <option value="CE">CE</option>
        </select>

        <br /><br />

        <label>Número de documento</label>
        <input
          required
          value={documentNumber}
          onChange={(e) => setDocumentNumber(e.target.value)}
        />

        <br /><br />

        <label>Nombre completo</label>
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <br /><br />

        <label>Fecha de nacimiento</label>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />

        <br /><br />

        <button disabled={loading}>
          {loading ? "Guardando..." : "Crear trabajadora"}
        </button>
      </form>
    </div>
  );
}

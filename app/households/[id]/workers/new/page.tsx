"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/app/components/Header";
import PageHeader from "@/components/PageHeader";

export default function NewWorkerInHouseholdPage() {
  const router = useRouter();
  const params = useParams();
  const householdId = params.id as string;

  const [fullName, setFullName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/login");
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !documentNumber || !startDate) {
      alert("Completa los campos obligatorios");
      return;
    }

    const confirmed = confirm(
      "¿Confirmas la creación de la trabajadora y su relación laboral con este hogar?"
    );
    if (!confirmed) return;

    setLoading(true);

    try {
      // 1️⃣ Obtener empleador
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      const { data: employer, error: employerError } = await supabase
        .from("employers")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!employer || employerError) {
        console.error("Employer error", employerError);
        alert("No se pudo obtener el empleador");
        setLoading(false);
        return;
      }

      // 2️⃣ Buscar trabajadora por DNI
      const { data: existingWorker } = await supabase
        .from("workers")
        .select("id")
        .eq("document_number", documentNumber)
        .maybeSingle();

      let workerId = existingWorker?.id;

      // 3️⃣ Crear trabajadora si no existe
      if (!workerId) {
        const { data: newWorker, error: workerError } = await supabase
          .from("workers")
          .insert({
            full_name: fullName,
            document_type: "DNI",
            document_number: documentNumber,
            birth_date: birthDate || null,
          })
          .select("id")
          .single();

        if (workerError || !newWorker) {
          console.error(workerError);
          alert("Error creando trabajadora");
          setLoading(false);
          return;
        }

        workerId = newWorker.id;
      }

      // 4️⃣ Crear relación laboral (una por hogar)
      const { error: relationError } = await supabase
        .from("employment_relationships")
        .insert({
          worker_id: workerId,
          household_id: householdId,
          start_date: startDate,
          regularization_mode: false,
          initial_vacation_balance: 0,
        });

      if (relationError) {
        console.error(relationError);
        alert("La trabajadora existe, pero falló la relación laboral");
        setLoading(false);
        return;
      }

      // 5️⃣ Volver al hogar
      router.push(`/households/${householdId}`);
    } catch (err) {
      console.error(err);
      alert("Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <Header />

      <PageHeader
        title="Nueva trabajadora"
        backTo={`/households/${householdId}`}
      />

      <form onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
        <div style={{ marginBottom: 12 }}>
          <label>Nombre completo *</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>DNI *</label>
          <input
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Fecha de nacimiento</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label>Inicio de relación laboral *</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Guardando…" : "Guardar trabajadora"}
        </button>
      </form>
    </div>
  );
}

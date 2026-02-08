"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/app/components/Header";
import PageHeader from "@/components/PageHeader";

type WorkerRelation = {
  id: string;
  start_date: string;
  workers: {
    id: string;
    full_name: string;
    document_number: string;
    birth_date: string | null;
  };
};

type Household = {
  id: string;
  name: string;
};

export default function HouseholdDetailPage() {
  const router = useRouter();
  const params = useParams();
  const householdId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [household, setHousehold] = useState<Household | null>(null);
  const [workers, setWorkers] = useState<WorkerRelation[]>([]);

  useEffect(() => {
    const loadData = async () => {
      // 1️⃣ Validar sesión
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push("/login");
        return;
      }

      // 2️⃣ Cargar hogar
      const { data: householdData, error: householdError } = await supabase
        .from("households")
        .select("id, name")
        .eq("id", householdId)
        .single();

      if (householdError || !householdData) {
        console.error("Error cargando hogar", householdError);
        router.push("/households");
        return;
      }

      setHousehold(householdData);

      // 3️⃣ Cargar trabajadoras del hogar
      const { data: relations, error: relationsError } = await supabase
        .from("employment_relationships")
        .select(
          `
          id,
          start_date,
          workers (
            id,
            full_name,
            document_number,
            birth_date
          )
        `
        )
        .eq("household_id", householdId)
        .order("start_date", { ascending: true });

      if (relationsError) {
        console.error("Error cargando trabajadoras", relationsError);
      } else {
        setWorkers(relations ?? []);
      }

      setLoading(false);
    };

    loadData();
  }, [router, householdId]);

  if (loading) {
    return <p style={{ padding: 40 }}>Cargando…</p>;
  }

  if (!household) {
    return <p style={{ padding: 40 }}>Hogar no encontrado.</p>;
  }

  return (
    <div style={{ padding: 40 }}>
      {/* Header global */}
      <Header />

      {/* Page header */}
      <PageHeader title={household.name} backTo="/households" />

      {/* Acción principal */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() =>
            router.push(`/households/${householdId}/workers/new`)
          }
        >
          ➕ Agregar trabajadora
        </button>
      </div>

      {/* Lista de trabajadoras */}
      {workers.length === 0 ? (
        <p>Este hogar aún no tiene trabajadoras registradas.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 16,
          }}
        >
          <thead>
            <tr>
              <th align="left">Nombre</th>
              <th align="left">DNI</th>
              <th align="left">Inicio relación</th>
            </tr>
          </thead>
          <tbody>
            {workers.map((rel) => (
              <tr key={rel.id}>
                <td>{rel.workers.full_name}</td>
                <td>{rel.workers.document_number}</td>
                <td>{rel.start_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

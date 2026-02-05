"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import ConfirmDialog from "@/app/components/ConfirmDialog";

export default function HouseholdDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [household, setHousehold] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("households")
        .select("*")
        .eq("id", id)
        .single();

      setHousehold(data);
    };

    load();
  }, [id]);

  async function deactivateHousehold() {
    await supabase
      .from("households")
      .update({ is_active: false })
      .eq("id", id);

    router.push("/home");
  }

  if (!household) return <p style={{ padding: 40 }}>Cargando…</p>;

  return (
    <div style={{ padding: 40 }}>
      <button onClick={() => router.back()}>← Regresar</button>

      <h1>{household.name}</h1>
      <p>{household.address}</p>

      {household.is_active && (
        <>
          <button
            style={{ marginTop: 24, color: "red" }}
            onClick={() => setShowConfirm(true)}
          >
            Desactivar hogar
          </button>

          <ConfirmDialog
            open={showConfirm}
            title="Desactivar hogar"
            message="¿Seguro? El hogar quedará inactivo pero el historial se conservará."
            onCancel={() => setShowConfirm(false)}
            onConfirm={deactivateHousehold}
          />
        </>
      )}
    </div>
  );
}

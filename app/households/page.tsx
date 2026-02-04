"use client";

import Link from "next/link";

export default function HouseholdsPage() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Mis hogares</h1>

      <p>Aquí se listarán los hogares.</p>

      <Link href="/households/new">
        ➕ Crear nuevo hogar
      </Link>
    </div>
  );
}

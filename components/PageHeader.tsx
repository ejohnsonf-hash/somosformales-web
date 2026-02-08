"use client";

import { useRouter } from "next/navigation";

type PageHeaderProps = {
  title: string;
  backTo?: string;
};

export default function PageHeader({ title, backTo = "/home" }: PageHeaderProps) {
  const router = useRouter();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        marginBottom: 24,
      }}
    >
      <button
        onClick={() => router.push(backTo)}
        style={{
          padding: "6px 10px",
          borderRadius: 6,
          border: "1px solid var(--border)",
          background: "transparent",
          cursor: "pointer",
        }}
      >
        ← Volver
      </button>

      <h1 style={{ margin: 0 }}>{title}</h1>
    </div>
  );
}

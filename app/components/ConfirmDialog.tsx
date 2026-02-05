"use client";

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title = "Confirmación",
  message,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "var(--bg)",
          color: "var(--text)",
          padding: 24,
          borderRadius: 8,
          width: 360,
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        }}
      >
        <h3 style={{ marginBottom: 12 }}>{title}</h3>
        <p style={{ marginBottom: 24 }}>{message}</p>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button onClick={onCancel}>Cancelar</button>
          <button
            onClick={onConfirm}
            style={{
              background: "#111",
              color: "white",
              padding: "6px 12px",
              borderRadius: 4,
            }}
          >
            Sí, confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

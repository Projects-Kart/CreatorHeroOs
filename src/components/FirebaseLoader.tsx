export function FirebaseLoader() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "hsl(var(--background))",
        zIndex: 9999,
        gap: "1.5rem",
      }}
    >
      {/* Animated logo mark */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "1rem",
          background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.6))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 40px hsl(var(--primary) / 0.35)",
          animation: "pulse 1.6s ease-in-out infinite",
        }}
      >
        {/* flame icon SVG */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10" />
          <path d="M12 6v6l4 2" />
        </svg>
      </div>

      {/* Spinner ring */}
      <div
        style={{
          width: 40,
          height: 40,
          border: "3px solid hsl(var(--border))",
          borderTopColor: "hsl(var(--primary))",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />

      <p
        style={{
          color: "hsl(var(--muted-foreground))",
          fontSize: "0.875rem",
          fontFamily: "Inter, sans-serif",
          letterSpacing: "0.05em",
        }}
      >
        Connecting to database…
      </p>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}

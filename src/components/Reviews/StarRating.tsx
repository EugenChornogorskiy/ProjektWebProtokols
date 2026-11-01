"use client"; 
export function StarRating({ value }: any) {
  return (
    <div style={{ display: "flex", gap: "1px",alignItems:"center" }}>
      {[...Array(5)].map((_, i) => {
        const n = i + 1;
        return (
          <span
            key={n} 
            style={{ 
              fontSize: "18px", 
              color: n <= value ? "#ffc107" : "#ccc",
            }}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

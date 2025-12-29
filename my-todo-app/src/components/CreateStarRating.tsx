"use client"; 
export function CreateStarRating({ value, formik }: any) {
  return (
    <div style={{ display: "flex", gap: "15px" }}>
      {[...Array(5)].map((_, i) => {
        const n = i + 1;
        return (
          <span
            key={n}
            onClick={() => { 
              formik.setFieldValue('rate', n); 
            }}
            style={{
              cursor: "pointer",
              fontSize: "40px",
              color: n <= value ? "#ffc107" : "rgba(131, 131, 131, 1)"
            }}
          >
            {n <= value ? "★" : "☆"}
          </span>
        );
      })}
    </div>
  );
}

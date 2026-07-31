import type { ReactNode } from "react";
import { ATANDA } from "@/lib/arkReportTheme";

interface SectionProps {
  title: string;
  children: ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <div style={{ marginTop: 20 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: ATANDA.blue,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          borderBottom: `2px solid ${ATANDA.line}`,
          paddingBottom: 4,
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

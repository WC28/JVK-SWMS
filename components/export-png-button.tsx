"use client";

import { toPng } from "html-to-image";
import { useState } from "react";

type ExportPngButtonProps = {
  targetId: string;
  fileName: string;
  className?: string;
  label?: string;
};

export function ExportPngButton({
  targetId,
  fileName,
  className,
  label = "Export PNG"
}: ExportPngButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    const element = document.getElementById(targetId);
    if (!element) {
      return;
    }

    setIsExporting(true);

    try {
      const dataUrl = await toPng(element, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 2
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = fileName;
      link.click();
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <button className={className ?? "button button-light"} onClick={handleExport} type="button">
      {isExporting ? "Exporting..." : label}
    </button>
  );
}

# Invoice Preview/PDF Parity

- The on-screen invoice preview and the downloaded PDF must visually match as closely as possible.
- Any style, spacing, layout, typography, color, table, header, footer, total, or section change made for the preview should be reflected in the generated PDF.
- Any PDF-specific style change should be checked against the preview so the user sees the same invoice before downloading.
- Do not treat the preview as a rough approximation. It is the visual source of truth for what the downloaded invoice should look like.
- When changing invoice presentation, inspect both the preview components and the PDF components/styles.
- Regenerate/download the PDF after style changes to verify that the downloaded file matches the preview.

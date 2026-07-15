# Invoice Preview/PDF Parity

- The on-screen invoice preview and the downloaded PDF must visually match as closely as possible.
- Any style, spacing, layout, typography, color, table, header, footer, total, or section change made for the preview should be reflected in the generated PDF.
- Any PDF-specific style change should be checked against the preview so the user sees the same invoice before downloading.
- Do not treat the preview as a rough approximation. It is the visual source of truth for what the downloaded invoice should look like.
- When changing invoice presentation, inspect both the preview components and the PDF components/styles.
- Regenerate/download the PDF after style changes to verify that the downloaded file matches the preview.
- Keep service and expense table behavior aligned between preview and PDF. Services include the attorney column; expenses intentionally omit it.
- Keep label wording aligned between preview and PDF, including subtotal, tax, total, signature, and payment sections.

# Feature Commit Discipline

- Group commits by coherent feature or behavior whenever possible.
- If a feature touches both app code and docs, stage and commit the matching docs with that feature.
- Avoid bundling unrelated invoice presentation, navigation/loading, auth, and configuration changes into one commit.

# Secrets

- Do not commit `.env.local`, access tokens, OAuth secrets, or personal access tokens.

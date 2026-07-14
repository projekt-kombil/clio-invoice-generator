export function imageSource(src: string | null): string | null {
  const trimmedSrc = src?.trim();

  if (!trimmedSrc) {
    return null;
  }

  if (trimmedSrc.startsWith("/")) {
    return trimmedSrc;
  }

  if (/^data:image\/(?:png|jpe?g);base64,/i.test(trimmedSrc)) {
    return trimmedSrc;
  }

  try {
    const url = new URL(trimmedSrc);

    return url.protocol === "http:" || url.protocol === "https:"
      ? trimmedSrc
      : null;
  } catch {
    return null;
  }
}

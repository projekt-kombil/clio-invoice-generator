import path from "node:path";

export function imageSource(src: string | null): string | null {
  if (!src) {
    return null;
  }

  if (src.startsWith("http") || src.startsWith("data:")) {
    return src;
  }

  return src.startsWith("/")
    ? path.join(process.cwd(), "public", src)
    : src;
}

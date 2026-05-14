/** Strip query and trailing slashes (except root). */
export function normalizePathname(pathname: string): string {
  const base = pathname.split("?")[0] || "/";
  if (base === "/" || base === "") return "/";
  return base.replace(/\/+$/, "") || "/";
}

/**
 * Active state for primary sidebar / bottom nav links.
 * Prevents `/invoices` from matching `/invoices/new`, `/invoices/received`, `/invoices/pay/...`.
 */
export function isNavActive(pathname: string, to: string): boolean {
  const p = normalizePathname(pathname);

  if (to === "/") return p === "/";

  if (to === "/invoices") {
    if (!p.startsWith("/invoices")) return false;
    if (p === "/invoices") return true;
    const rest = p.slice("/invoices".length);
    if (rest.startsWith("/new")) return false;
    if (rest.startsWith("/received")) return false;
    if (rest.startsWith("/pay")) return false;
    return true;
  }

  if (to === "/invoices/new") {
    return p === "/invoices/new" || p.startsWith("/invoices/new/");
  }
  if (to === "/invoices/received") {
    return p === "/invoices/received" || p.startsWith("/invoices/received/");
  }
  if (to === "/search") {
    return p === "/search" || p.startsWith("/search/");
  }

  return p === to || p.startsWith(`${to}/`);
}

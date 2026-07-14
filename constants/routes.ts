export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  APPROVE: "/",
  LOANS: "/loans",
  BRANCHES: "/branches",
} as const;

export const PUBLIC_ROUTES = [ROUTES.LOGIN] as const;

/** Trang ký HĐ công khai cho khách (QR) */
export const isLoanSignPublicRoute = (pathname: string): boolean =>
  /^\/loans\/[^/]+\/sign$/.test(pathname);

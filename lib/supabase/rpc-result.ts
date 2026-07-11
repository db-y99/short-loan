export type TRpcJsonResult = {
  success: boolean;
  error?: string;
  [key: string]: unknown;
};

export const isRpcNotFoundError = (
  error: { code?: string; message?: string } | null,
) => {
  if (!error) return false;
  return (
    error.code === "PGRST202" ||
    error.code === "42883" ||
    error.message?.includes("Could not find the function") === true
  );
};

export const isPostgrestSchemaCacheError = (
  error: { code?: string; message?: string } | null,
) => {
  if (!error) return false;
  return (
    error.code === "PGRST204" ||
    error.message?.includes("schema cache") === true
  );
};

export const parseRpcResult = (data: unknown): TRpcJsonResult => {
  if (!data || typeof data !== "object") {
    return { success: false, error: "Phản hồi RPC không hợp lệ" };
  }
  return data as TRpcJsonResult;
};

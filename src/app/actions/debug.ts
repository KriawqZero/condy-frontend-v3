"use server";

export function handleConsoleLog(
  message: string,
  type: "log" | "error" | "warn" | "info" = "log"
) {
  if (typeof window !== "undefined") {
    // Client-side logging
    console[type](message);
  } else {
    // Server-side logging
    console[type](`[Server Log]: ${message}`);
  }
}

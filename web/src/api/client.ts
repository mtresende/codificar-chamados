import createClient from "openapi-fetch";

import type { paths } from "./generated/openapi";

const API_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "/api";

export const apiClient = createClient<paths>({
  baseUrl: API_URL,
});
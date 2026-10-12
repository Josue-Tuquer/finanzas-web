const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

export const AUTH_TOKEN_STORAGE_KEY = "auth_token";
export const AUTH_USER_STORAGE_KEY = "auth_user";
export const AUTH_SESSION_INVALID_EVENT = "auth:session-invalid";

export function getAuthToken() {
  if (typeof localStorage === "undefined") return null;

  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function setAuthToken(token) {
  if (typeof localStorage === "undefined") return;

  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export function getAuthUser() {
  if (typeof localStorage === "undefined") return null;

  const storedUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
}

export function setAuthUser(user) {
  if (typeof localStorage === "undefined") return;

  localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearAuthToken() {
  if (typeof localStorage === "undefined") return;

  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}

export function clearAuthSession() {
  clearAuthToken();

  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  }
}

async function request(path, { method = "GET", body, headers, ...options } = {}) {
  if (!API_BASE_URL) {
    throw new Error("Falta configurar VITE_API_URL en el archivo .env del frontend.");
  }

  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");

  const token = getAuthToken();
  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const requestBody = body === undefined
    ? undefined
    : isFormData || typeof body === "string"
      ? body
      : JSON.stringify(body);

  if (requestBody !== undefined && !isFormData && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}/${String(path).replace(/^\/+/, "")}`, {
    ...options,
    method,
    headers: requestHeaders,
    body: requestBody,
  });

  const responseText = await response.text();
  let responseData = null;

  if (responseText) {
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }
  }

  if (response.status === 401) {
    if (token) {
      clearAuthSession();
      window.dispatchEvent(new Event(AUTH_SESSION_INVALID_EVENT));
    }
  }

  if (!response.ok) {
    const message = getErrorMessage(responseData, response.status);
    const error = new Error(message);
    error.status = response.status;

    if (responseData && typeof responseData === "object") {
      error.errors = responseData.errors;
    }

    throw error;
  }

  return responseData;
}

function getErrorMessage(responseData, status) {
  if (responseData && typeof responseData === "object") {
    if (typeof responseData.message === "string" && responseData.message.trim()) {
      return responseData.message;
    }

    const validationMessages = Object.values(responseData.errors ?? {}).flat();
    if (typeof validationMessages[0] === "string") {
      return validationMessages[0];
    }
  }

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  return `Error en la solicitud (${status}).`;
}

export function get(path, options) {
  return request(path, { ...options, method: "GET" });
}

export function post(path, body, options) {
  return request(path, { ...options, method: "POST", body });
}

export function put(path, body, options) {
  return request(path, { ...options, method: "PUT", body });
}

export function remove(path, options) {
  return request(path, { ...options, method: "DELETE" });
}

const api = { get, post, put, delete: remove };

export default api;

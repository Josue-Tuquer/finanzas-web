const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

export const AUTH_TOKEN_STORAGE_KEY = "auth_token";
export const AUTH_USER_STORAGE_KEY = "auth_user";
export const AUTH_SESSION_INVALID_EVENT = "auth:session-invalid";
const AUTH_KEY_DB_NAME = "finanzas-web-auth";
const AUTH_KEY_STORE_NAME = "crypto-keys";
const AUTH_KEY_ID = "local-storage-aes-gcm-v1";
const ENCRYPTED_VALUE_PREFIX = "enc:v1:";

let authKeyPromise;

function openAuthKeyDatabase() {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("Este navegador no permite almacenar la clave de sesión."));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(AUTH_KEY_DB_NAME, 1);

    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(AUTH_KEY_STORE_NAME)) {
        request.result.createObjectStore(AUTH_KEY_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function readCryptoKey(database) {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(AUTH_KEY_STORE_NAME, "readonly");
    const request = transaction.objectStore(AUTH_KEY_STORE_NAME).get(AUTH_KEY_ID);

    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

function storeCryptoKey(database, key) {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(AUTH_KEY_STORE_NAME, "readwrite");
    transaction.objectStore(AUTH_KEY_STORE_NAME).add(key, AUTH_KEY_ID);
    transaction.oncomplete = () => resolve(key);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error ?? new Error("No se pudo guardar la clave."));
  });
}

async function getAuthCryptoKey() {
  if (!authKeyPromise) {
    authKeyPromise = (async () => {
      const database = await openAuthKeyDatabase();
      const existingKey = await readCryptoKey(database);
      if (existingKey) return existingKey;

      const generatedKey = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"],
      );

      try {
        return await storeCryptoKey(database, generatedKey);
      } catch (error) {
        // Another tab may have created the key at the same time.
        const concurrentKey = await readCryptoKey(database);
        if (concurrentKey) return concurrentKey;
        throw error;
      }
    })().catch((error) => {
      authKeyPromise = null;
      throw error;
    });
  }

  return authKeyPromise;
}

function encodeBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function decodeBase64(value) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function encryptValue(value) {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error("El cifrado de sesión requiere un navegador compatible y HTTPS.");
  }

  const key = await getAuthCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(value));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  const payload = {
    iv: encodeBase64(iv),
    data: encodeBase64(new Uint8Array(ciphertext)),
  };

  return ENCRYPTED_VALUE_PREFIX + JSON.stringify(payload);
}

async function decryptValue(value) {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error("El descifrado de sesión requiere un navegador compatible y HTTPS.");
  }

  const payload = JSON.parse(value.slice(ENCRYPTED_VALUE_PREFIX.length));
  const key = await getAuthCryptoKey();
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: decodeBase64(payload.iv) },
    key,
    decodeBase64(payload.data),
  );

  return JSON.parse(new TextDecoder().decode(plaintext));
}

async function readAuthValue(storageKey) {
  if (typeof localStorage === "undefined") return null;

  const storedValue = localStorage.getItem(storageKey);
  if (!storedValue) return null;

  if (storedValue.startsWith(ENCRYPTED_VALUE_PREFIX)) {
    return decryptValue(storedValue);
  }

  // Upgrade values saved in plain text by the previous session implementation.
  const value = storageKey === AUTH_TOKEN_STORAGE_KEY ? storedValue : JSON.parse(storedValue);
  await writeAuthValue(storageKey, value);
  return value;
}

async function writeAuthValue(storageKey, value) {
  if (typeof localStorage === "undefined") return;

  localStorage.setItem(storageKey, await encryptValue(value));
}

export function getAuthToken() {
  return readAuthValue(AUTH_TOKEN_STORAGE_KEY);
}

export function setAuthToken(token) {
  return writeAuthValue(AUTH_TOKEN_STORAGE_KEY, token);
}

export function getAuthUser() {
  return readAuthValue(AUTH_USER_STORAGE_KEY);
}

export function setAuthUser(user) {
  return writeAuthValue(AUTH_USER_STORAGE_KEY, user);
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

  const token = await getAuthToken();
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
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(AUTH_SESSION_INVALID_EVENT));
      }
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

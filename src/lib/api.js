// LeadFlow CRM — API Client (fetch wrapper + auth)

class ApiClient {
  constructor(baseUrl = "") {
    this.baseUrl = baseUrl;
  }

  async request(method, path, body = null, token = null) {
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      method,
      headers,
    };

    if (body && method !== "GET") {
      config.body = JSON.stringify(body);
    }

    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, config);

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      if (!response.ok) {
        throw new ApiError(response.status, "NETWORK_ERROR", "Error de red");
      }
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.error?.code || "UNKNOWN_ERROR",
        data.error?.message || "Error desconocido",
        data.error?.details
      );
    }

    // Unwrap the { data: ... } envelope from sendSuccess
    return data.data !== undefined ? data.data : data;
  }

  get(path, token) {
    return this.request("GET", path, null, token);
  }

  post(path, body, token) {
    return this.request("POST", path, body, token);
  }

  put(path, body, token) {
    return this.request("PUT", path, body, token);
  }

  patch(path, body, token) {
    return this.request("PATCH", path, body, token);
  }

  delete(path, token) {
    return this.request("DELETE", path, null, token);
  }
}

class ApiError extends Error {
  constructor(status, code, message, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const apiClient = new ApiClient();
export { ApiError };

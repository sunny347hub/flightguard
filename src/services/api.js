const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";

async function request(endpoint, options = {}) {
  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Backend request failed with status ${response.status}.`;

    throw new Error(message);
  }

  return data;
}

export function getHealth() {
  return request("/health");
}

export function getConfig() {
  return request("/api/config");
}

export function getFlight(flightNumber) {
  return request(
    `/api/flights/${encodeURIComponent(flightNumber.trim().toUpperCase())}`
  );
}

export function createFlight(flightData) {
  return request("/api/flights", {
    method: "POST",
    body: JSON.stringify(flightData),
  });
}

export function getPolicies() {
  return request("/api/policies");
}

export function getPolicy(policyId) {
  return request(`/api/policies/${encodeURIComponent(policyId)}`);
}

export function updateFlightDelay(policyId, actualDelay) {
  return request("/api/oracle/update-delay", {
    method: "POST",
    body: JSON.stringify({
      policyId: policyId,
      actualDelay: actualDelay,
    }),
  });
}

export function processPayout(policyId) {
  return request(`/api/claims/${encodeURIComponent(policyId)}/payout`, {
    method: "POST",
  });
}

export function assessFlightRisk(flightData) {
  return request("/api/ai/risk", {
    method: "POST",
    body: JSON.stringify(flightData),
  });
}

export function submitFeedback(feedback) {
  return request("/api/feedback", {
    method: "POST",
    body: JSON.stringify(feedback),
  });
}

export function getFeedback() {
  return request("/api/feedback");
}

export function getTransaction(txHash) {
  return request(
    `/api/transactions/${encodeURIComponent(txHash)}`
  );
}

export { BACKEND_URL };
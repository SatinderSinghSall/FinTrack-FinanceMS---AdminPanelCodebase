const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function adminApi(endpoint: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("fintrack_admin_token")
      : null;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...(options.headers || {}),
    },
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = {
      success: false,
      message: "Invalid server response",
    };
  }

  if (!response.ok) {
    throw new Error(data?.message || "Something went wrong");
  }

  return data;
}

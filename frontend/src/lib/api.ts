export const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");
    return res.json();
}

export async function getUserProfile(email: string) {
    const res = await fetch(`${API_BASE}/user/${email}`);
    if (!res.ok) throw new Error("Failed to fetch profile");
    return res.json();
}

export async function updateUserProfile(email: string, updates: any) {
    const res = await fetch(`${API_BASE}/user/${email}`, {
        method: "POST", // Using POST for updates as per routes.ts
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Update failed");
    return res.json();
}

export async function send2FA(email: string) {
    const res = await fetch(`${API_BASE}/auth/2fa/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error("Failed to send OTP");
    return res.json();
}

export async function verify2FA(email: string, otp: string) {
    const res = await fetch(`${API_BASE}/auth/2fa/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
    });
    if (!res.ok) throw new Error("Verification failed");
    return res.json();
}

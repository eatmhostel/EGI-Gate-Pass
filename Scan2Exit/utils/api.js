const EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL;
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";

// ✅ Helper: Safe JSON parse from response — NOW with error logging
const safeParseResponse = async (response) => {
    const text = await response.text();

    // ✅ If response is NOT OK, log error details and throw
    if (!response.ok) {
        console.error(`❌ API Error ${response.status} for URL`);
        console.error("Response body:", text.substring(0, 300));
        throw new Error(`Request failed (Status: ${response.status})`);
    }

    // ✅ Try to parse JSON
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("❌ Non-JSON Response:", text.substring(0, 300));
        throw new Error(`Invalid server response (Status: ${response.status})`);
    }
};

// ✅ Get auth headers automatically
const getHeaders = async () => {
    const token = await AsyncStorage.getItem("authToken");
    return {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : "",
    };
};

// ✅ Authenticated GET request
export const authGet = async (endpoint) => {
    const headers = await getHeaders();
    const url = `${EXPO_PUBLIC_API_URL}${endpoint}`;
    console.log("📡 GET:", url);  // ← Debug: see full URL
    const response = await fetch(url, {
        method: "GET",
        headers,
    });
    return await safeParseResponse(response);
};

// ✅ Authenticated POST request
export const authPost = async (endpoint, body) => {
    const headers = await getHeaders();
    const url = `${EXPO_PUBLIC_API_URL}${endpoint}`;
    console.log("📡 POST:", url);
    const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });
    return await safeParseResponse(response);
};

// ✅ Authenticated PUT request
export const authPut = async (endpoint, body) => {
    const headers = await getHeaders();
    const url = `${EXPO_PUBLIC_API_URL}${endpoint}`;
    console.log("📡 PUT:", url);
    const response = await fetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
    });
    return await safeParseResponse(response);
};

// ✅ Authenticated DELETE request
export const authDelete = async (endpoint) => {
    const headers = await getHeaders();
    const url = `${EXPO_PUBLIC_API_URL}${endpoint}`;
    console.log("📡 DELETE:", url);
    const response = await fetch(url, {
        method: "DELETE",
        headers,
    });
    return await safeParseResponse(response);
};

// ✅ Public GET request (no auth)
export const publicGet = async (endpoint) => {
    const url = `${EXPO_PUBLIC_API_URL}${endpoint}`;
    console.log("📡 GET (public):", url);
    const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    return await safeParseResponse(response);
};

// ✅ Public POST request (no auth)
export const publicPost = async (endpoint, body) => {
    const url = `${EXPO_PUBLIC_API_URL}${endpoint}`;
    console.log("📡 POST (public):", url);
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return await safeParseResponse(response);
};

// ✅✅✅ Download PDF with Auth
export const authDownloadPdf = async (endpoint, filename) => {
    const token = await AsyncStorage.getItem("authToken");
    const url = `${EXPO_PUBLIC_API_URL}${endpoint}`;
    const fileUri = `${FileSystem.cacheDirectory}${filename}`;

    const downloadResult = await FileSystem.downloadAsync(url, fileUri, {
        headers: {
            "Authorization": token ? `Bearer ${token}` : "",
        },
    });

    if (downloadResult.status !== 200) {
        try { await FileSystem.deleteAsync(fileUri); } catch (e) {}
        throw new Error(`Download failed (Status: ${downloadResult.status})`);
    }

    return downloadResult.uri;
};
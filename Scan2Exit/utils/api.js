import { EXPO_PUBLIC_API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
// ✅ Use namespace import (*) to get cacheDirectory and downloadAsync
import * as FileSystem from "expo-file-system/legacy";

// ✅ Helper: Safe JSON parse from response
const safeParseResponse = async (response) => {
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        throw new Error(`Invalid JSON response (Status: ${response.status})`);
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
    const response = await fetch(`${EXPO_PUBLIC_API_URL}${endpoint}`, {
        method: "GET",
        headers,
    });
    return await safeParseResponse(response);
};

// ✅ Authenticated POST request
export const authPost = async (endpoint, body) => {
    const headers = await getHeaders();
    const response = await fetch(`${EXPO_PUBLIC_API_URL}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });
    return await safeParseResponse(response);
};

// ✅ Authenticated PUT request
export const authPut = async (endpoint, body) => {
    const headers = await getHeaders();
    const response = await fetch(`${EXPO_PUBLIC_API_URL}${endpoint}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
    });
    return await safeParseResponse(response);
};

// ✅ Authenticated DELETE request
export const authDelete = async (endpoint) => {
    const headers = await getHeaders();
    const response = await fetch(`${EXPO_PUBLIC_API_URL}${endpoint}`, {
        method: "DELETE",
        headers,
    });
    return await safeParseResponse(response);
};

// ✅ Public GET request (no auth)
export const publicGet = async (endpoint) => {
    const response = await fetch(`${EXPO_PUBLIC_API_URL}${endpoint}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    return await safeParseResponse(response);
};

// ✅ Public POST request (no auth)
export const publicPost = async (endpoint, body) => {
    const response = await fetch(`${EXPO_PUBLIC_API_URL}${endpoint}`, {
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

    // If server returned error, delete the junk file
    if (downloadResult.status !== 200) {
        try { await FileSystem.deleteAsync(fileUri); } catch (e) {}
        throw new Error(`Download failed (Status: ${downloadResult.status})`);
    }

    return downloadResult.uri;
};
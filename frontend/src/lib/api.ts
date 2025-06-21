import { CourseDetail, CourseRecommendationResponse } from "@/types/language";
import Cookies from "js-cookie";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function recommendCourses(
  userQuestion: string
): Promise<CourseRecommendationResponse> {
  const url = `${BACKEND_URL}/recommend-courses`;
  console.log("🔍 Calling API:", url);
  console.log("📝 Request body:", { user_question: userQuestion });

  // Get JWT token from cookies
  const jwt = Cookies.get("knewbit_jwt");
  console.log("🔑 JWT token exists:", !!jwt);

  if (!jwt) {
    throw new Error("Authentication required. Please sign in first.");
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      credentials: "include", // Include cookies for authentication
      body: JSON.stringify({
        user_question: userQuestion,
      }),
    });
    console.log("🔍 Response:", response);

    console.log("📡 Response status:", response.status);
    console.log(
      "📡 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error Response:", errorText);
      throw new Error(
        `Failed to get recommendations: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log("✅ API Success Response:", data);
    return data;
  } catch (error) {
    console.error("🚨 API Call Failed:", error);
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Network error: Cannot connect to backend at ${url}. Is the backend running?`
      );
    }
    throw error;
  }
}

export async function dubVideo(
  youtubeUrl: string,
  targetLanguage: string,
  langCode: string
): Promise<Blob> {
  const url = `${BACKEND_URL}/dub`;
  console.log("🔍 Calling Video Dubbing API:", url);

  // Get JWT token from cookies
  const jwt = Cookies.get("knewbit_jwt");
  console.log("🔑 JWT token exists for dubbing:", !!jwt);

  if (!jwt) {
    throw new Error("Authentication required. Please sign in first.");
  }

  const formData = new FormData();
  formData.append("youtube_url", youtubeUrl);
  formData.append("target_language", targetLanguage);
  formData.append("lang_code", langCode);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      body: formData,
    });

    console.log("📡 Video Dubbing Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Video Dubbing API Error:", errorText);
      throw new Error(
        `Failed to dub video: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    console.log("✅ Video Dubbing Success - returning blob");
    return response.blob();
  } catch (error) {
    console.error("🚨 Video Dubbing API Call Failed:", error);
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Network error: Cannot connect to dubbing API at ${url}. Is the backend running?`
      );
    }
    throw error;
  }
}

export async function getCourseDetails(slug: string): Promise<CourseDetail> {
  const url = `${API_URL}/courses/${slug}`;
  console.log("🔍 Calling Course Details API:", url);

  // Get JWT token from cookies
  const jwt = Cookies.get("knewbit_jwt");
  console.log("🔑 JWT token exists for course details:", !!jwt);

  if (!jwt) {
    throw new Error("Authentication required. Please sign in first.");
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    });

    console.log("📡 Course Details Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Course Details API Error:", errorText);
      throw new Error(
        `Failed to get course details: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log("✅ Course Details Success:", data);
    return data;
  } catch (error) {
    console.error("🚨 Course Details API Call Failed:", error);
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Network error: Cannot connect to course API at ${url}. Is the course API running?`
      );
    }
    throw error;
  }
}

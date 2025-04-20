const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000' 
  : process.env.REACT_APP_API_BASE_URL || "https://builder-pro-1.onrender.com";

export const uploadFile = async (file, userId) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);

    const response = await fetch(`${API_URL}/upload`, {
      method: "POST",
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error("Failed to upload file");
    }

    return await response.json();
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

export const fetchFiles = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/files?userId=${userId}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error("Failed to fetch files");
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export const deleteFile = async (userId, fileName) => {
  try {
    const response = await fetch(`${API_URL}/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, fileName }),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error("Failed to delete file");
    }

    return await response.json();
  } catch (error) {
    console.error("Delete error:", error);
    throw error;
  }
};

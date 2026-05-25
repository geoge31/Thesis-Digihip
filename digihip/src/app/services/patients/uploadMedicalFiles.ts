/**
 * Upload Medical Files Service
 * @path /digihip/src/app/services/patients/uploadMedicalFiles.ts
 */

export const uploadMedicalFiles = async (
  patientId: string,
  files: File[]
): Promise<{ success: boolean; message: string; files?: string[] }> => {
  if (!files || files.length === 0) {
    return {
      success: true,
      message: "No files to upload",
    };
  }

  try {
    const formData = new FormData();
    formData.append("patientId", patientId);

    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch("/api/patients/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to upload files");
    }

    const data = await response.json();
    return {
      success: true,
      message: "Files uploaded successfully",
      files: data.files,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error uploading medical files:", error);
      return {
        success: false,
        message: error.message,
      };
    }
    return {
      success: false,
      message: "Unknown error occurred while uploading files",
    };
  }
};

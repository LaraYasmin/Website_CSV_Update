import React, { useState } from "react";
import axios from "axios";

interface UploadProps {
  onUpload: (data: string) => void;
}

const Upload: React.FC<UploadProps> = ({ onUpload }) => {
  const [file, setFile] = useState<File | null>(null);

  const handleOnChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const csvData = await readUploadedFile(selectedFile);
      if (csvData) {
        await sendFileToBackend(csvData);
        onUpload(csvData);
      }
    }
  };

  const readUploadedFile = async (file: File): Promise<string | null> => {
    const fileReader = new FileReader();
    return new Promise((resolve) => {
      fileReader.onload = (e) => {
        if (e.target) {
          const csvData = e.target.result as string;
          resolve(csvData);
        } else {
          resolve(null);
        }
      };
      fileReader.readAsText(file);
    });
  };

  const sendFileToBackend = async (csvData: string) => {
    try {
      const formData = new FormData();
      formData.append(
        "file",
        new Blob([csvData], { type: "text/csv" }),
        file?.name
      );
      await axios.post("http://localhost:3000/api/files", formData);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleButtonClick = () => {
    const fileInput = document.getElementById("csvFileInput");
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <div>
      <button className="btn btn-success" onClick={handleButtonClick}>
        Upload
      </button>
      <input
        data-testid="csvFileInput"
        className="btn btn-outline-success"
        type="file"
        title="Upload"
        id="csvFileInput"
        accept=".csv"
        onChange={handleOnChange}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default Upload;

import axios from "axios";
import React, { useState } from "react";
import "./App.css";

// Optional: real SHA-256 (recommended if backend validates sha256)
async function sha256FromBase64(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState("");

  // Only selects file (no upload here)
  const onFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setStatus(file ? `Selected: ${file.name}` : "No file selected");
  };

  // Upload happens here
  const onFileUpload = async () => {
    if (!selectedFile) {
      setStatus("Pick a file first.");
      return;
    }

    setStatus("Reading file...");

    const reader = new FileReader();

    reader.onloadstart = () => console.log("FileReader: loadstart");

    reader.onload = async () => {
      try {
        console.log("FileReader: onload fired");

        const b64s = String(reader.result).split(",")[1];

        // If backend enforces sha256, use real hash:
        const sha = await sha256FromBase64(b64s);

        const payload = {
          project_id: "cretebid example",
          files: [
            {
              filename: selectedFile.name, // MUST be "filename" per Swagger
              uri: `data:${selectedFile.type || "application/pdf"};base64,${b64s}`,
              sha256: sha,
              uploaded_by: "frontend",
              tags: ["upload"],
            },
          ],
          options: { dedup: "hash" },
        };

        console.log("Posting to backend...", payload);
        setStatus("Uploading to backend...");

        const res = await axios.post(
          "http://127.0.0.1:8000/v1/ingest/run",
          payload,
          { headers: { "Content-Type": "application/json" } }
        );

        console.log("Backend success:", res.status, res.data);
        setStatus(`✅ Upload success (HTTP ${res.status})`);
      } catch (err) {
        console.error("Upload failed:", err);
        console.error("Status:", err?.response?.status);
        console.error("Raw data:", err?.response?.data);
        console.log("Full error JSON:");
        console.log(JSON.stringify(err?.response?.data, null, 2));

        setStatus(`❌ Upload failed (HTTP ${err?.response?.status ?? "unknown"})`);
      }
    };

    reader.onerror = (e) => {
      console.error("FileReader error:", e);
      setStatus("❌ Failed to read file.");
    };

    // THIS triggers reader.onload
    reader.readAsDataURL(selectedFile);
  };

  const fileData = () => {
    if (!selectedFile) {
      return (
        <div>
          <br />
          <h4>Choose a File before Pressing the Upload button</h4>
        </div>
      );
    }

    return (
      <div>
        <h2>File Details:</h2>
        <p>File Name: {selectedFile.name}</p>
        <p>File Type: {selectedFile.type}</p>
        <p>Last Modified: {new Date(selectedFile.lastModified).toDateString()}</p>
      </div>
    );
  };

  return (
    <div className="App">
      <h1>CreteBid</h1>
      <h3>File Upload (Using React)</h3>

      <div>
        <input type="file" accept="application/pdf" onChange={onFileChange} />
        <button onClick={onFileUpload}>Upload!</button>
      </div>

      <p style={{ marginTop: 12 }}>{status}</p>

      {fileData()}
    </div>
  );
};

export default App;

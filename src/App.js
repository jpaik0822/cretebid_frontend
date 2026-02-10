import axios from "axios";
import React, { useState } from "react";
import './App.css';

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  // Update change in file
  const onFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Update logs when file is uploaded
  const onFileUpload = () => {
    const formData = new FormData();
    formData.append(
      "myFile",
      selectedFile,
      selectedFile.name
    );
    console.log(selectedFile);
    axios.post("api/uploadfile", formData);
  };

  // printing file data
  const fileData = () => {
    if (selectedFile) {
      return (
        <div>
          <h2>File Details:</h2>
          <p>File Name: {selectedFile.name}</p>
          <p>File Type: {selectedFile.type}</p>
          <p>
            Last Modified: {selectedFile.lastModifiedDate.toDateString()}
          </p>
        </div>
      );
    } else {
      return (
        <div>
          <br />
          <h4>Choose before Pressing the Upload button</h4>
        </div>
      );
    }
  };

  // App Visuals(UI)
  return (
    <div className="App">
      <h1>CreteBid</h1>
      <h3>File Upload (Using React)</h3>
      <p>(Upload button is currently unfuctional at the moment)</p>
      <div>
        <input type="file" onChange={onFileChange} />
        <button
          onClick={() =>
            selectedFile == null ? alert("Upload a file first") : { onFileUpload }
          }
        >
          Upload!
        </button>
      </div>
      {fileData()}
    </div>
  );
};

export default App;

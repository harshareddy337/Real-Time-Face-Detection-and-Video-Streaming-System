import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const videoRef = useRef();
  const imgRef = useRef();

  const [status, setStatus] = useState("Connecting...");
  const [rois, setRois] = useState([]);

  useEffect(() => {
    const uploadWS = new WebSocket("ws://localhost:8000/ws/upload");
    const streamWS = new WebSocket("ws://localhost:8000/ws/stream");
    streamWS.binaryType = "blob";

    uploadWS.onopen = () => setStatus("Upload connected 🟢");
    streamWS.onopen = () => console.log("Stream socket open");
    uploadWS.onerror = (err) => console.error("Upload WS error", err);
    streamWS.onerror = (err) => console.error("Stream WS error", err);

    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
      });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    setInterval(() => {
      if (!videoRef.current) return;
      if (!videoRef.current.videoWidth || !videoRef.current.videoHeight) return;

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      ctx.drawImage(videoRef.current, 0, 0);

      canvas.toBlob(blob => {
        if (uploadWS.readyState === 1) {
          uploadWS.send(blob);
        }
      }, "image/jpeg");
    }, 120);

    streamWS.onmessage = (event) => {
      const url = URL.createObjectURL(event.data);
      imgRef.current.src = url;
      setStatus("Detecting Face 👀");
    };

    streamWS.onclose = () => console.warn("Stream socket closed");
    streamWS.onmessageerror = (err) => console.error("Stream WS message error", err);

    setInterval(async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/rois");
        setRois(res.data.slice(-6));
      } catch {}
    }, 2000);

  }, []);

  return (
    <div className="app">
      <header>
        <h1>🎯 AI Face Detection Dashboard</h1>
        <span className="status">{status}</span>
      </header>

      <div className="main-grid">

        <div className="card">
          <h3>📷 Live Camera</h3>
          <video ref={videoRef} autoPlay />
        </div>

        <div className="card">
          <h3>🧠 Processed Feed</h3>
          <img ref={imgRef} alt="processed" />
        </div>

        <div className="card roi">
          <h3>📊 ROI Data</h3>
          {rois.length === 0 ? (
            <p>No detections yet...</p>
          ) : (
            rois.map((r, i) => (
              <div key={i} className="roi-item">
                <div>X: {r.x}</div>
                <div>Y: {r.y}</div>
                <div>W: {r.width}</div>
                <div>H: {r.height}</div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default App;
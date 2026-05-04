import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const videoRef = useRef();
  const imgRef = useRef();

  const [status, setStatus] = useState("Connecting...");
  const [rois, setRois] = useState([]);

  useEffect(() => {
    const uploadWs = new WebSocket("ws://localhost:8000/ws/upload");
    const streamWs = new WebSocket("ws://localhost:8000/ws/stream");

    uploadWs.onopen = () => setStatus("Connected 🟢");
    streamWs.onmessage = (event) => {
      const url = URL.createObjectURL(event.data);
      imgRef.current.src = url;
      setStatus("Detecting Face 👀");
    };

    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const interval = setInterval(() => {
      if (!videoRef.current || uploadWs.readyState !== 1) return;

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      ctx.drawImage(videoRef.current, 0, 0);

      canvas.toBlob(blob => {
        if (uploadWs.readyState === 1 && blob) uploadWs.send(blob);
      }, "image/jpeg");
    }, 120);

    const roiInterval = setInterval(async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/rois");
        setRois(res.data.slice(-5));
      } catch {}
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(roiInterval);
      uploadWs.close();
      streamWs.close();
    };
  }, []);

  return (
    <div className="app">
      <h1>🎯 Real-Time Face Detection System</h1>
      <div className="status">{status}</div>
      <div className="container">
        <div className="video-box">
          <h3>📷 Live Camera</h3>
          <video ref={videoRef} autoPlay muted />
        </div>
        <div className="video-box">
          <h3>🧠 Processed Output</h3>
          <img ref={imgRef} alt="output" />
        </div>
        <div className="roi-box">
          <h3>📊 ROI Data</h3>
          {rois.map((r, i) => (
            <div key={i} className="roi-item">
              x:{r.x}, y:{r.y}, w:{r.width}, h:{r.height}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;

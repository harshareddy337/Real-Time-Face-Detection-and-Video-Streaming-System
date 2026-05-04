import asyncio

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, SessionLocal
from .models import Base, Detection
from .face_service import detect_face

from PIL import Image
import io

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

latest_frame = None

# 1️⃣ RECEIVE VIDEO FEED
@app.websocket("/ws/upload")
async def upload(ws: WebSocket):
    global latest_frame

    await ws.accept()
    db = SessionLocal()

    try:
        while True:
            data = await ws.receive_bytes()
            image = Image.open(io.BytesIO(data))

            processed_img, bbox = detect_face(image)

            if bbox:
                x, y, w, h = bbox
                db.add(Detection(x=x, y=y, width=w, height=h))
                db.commit()

            latest_frame = processed_img
    finally:
        db.close()


# 2️⃣ SERVE PROCESSED VIDEO
@app.websocket("/ws/stream")
async def stream(ws: WebSocket):
    await ws.accept()

    while True:
        if latest_frame:
            buf = io.BytesIO()
            latest_frame.save(buf, format="JPEG")
            await ws.send_bytes(buf.getvalue())
            await asyncio.sleep(0.05)
        else:
            await asyncio.sleep(0.1)


# 3️⃣ ROI DATA API
@app.get("/api/rois")
def get_rois():
    def normalize_value(value):
        if isinstance(value, bytes):
            return int.from_bytes(value, byteorder="little", signed=True)
        return int(value)

    db = SessionLocal()
    try:
        data = db.query(Detection).all()

        return [
            {
                "x": normalize_value(d.x),
                "y": normalize_value(d.y),
                "width": normalize_value(d.width),
                "height": normalize_value(d.height),
            }
            for d in data
        ]
    finally:
        db.close()
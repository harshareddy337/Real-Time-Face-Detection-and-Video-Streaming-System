from PIL import Image, ImageDraw
import numpy as np
import cv2
import os

cascade_path = os.path.join(os.path.dirname(__file__), 'haarcascade_frontalface_default.xml')
face_cascade = cv2.CascadeClassifier(cascade_path)


def detect_face(image):
    """Detect faces in an image and draw bounding boxes."""
    image_rgb = image.convert("RGB")
    frame = np.array(image_rgb)
    gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    if len(faces) == 0:
        return image, None

    x, y, w, h = faces[0]
    x = max(0, x)
    y = max(0, y)
    w = max(0, min(w, frame.shape[1] - x))
    h = max(0, min(h, frame.shape[0] - y))

    draw = ImageDraw.Draw(image)
    draw.rectangle([(x, y), (x + w, y + h)], outline="red", width=3)

    return image, (x, y, w, h)
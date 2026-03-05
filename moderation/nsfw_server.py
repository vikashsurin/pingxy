from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

USE_ONNX = os.getenv("USE_ONNX", "false").lower() == "true"

print(f"Loading model... (onnx={USE_ONNX})")

if USE_ONNX:
    from optimum.pipelines import pipeline
    classifier = pipeline(
        "image-classification",
        model="Falconsai/nsfw_image_detection",
        accelerator="onnxruntime",
    )
else:
    from transformers import pipeline
    classifier = pipeline(
        "image-classification",
        model="Falconsai/nsfw_image_detection",
        device="cpu",
    )

print("Model ready!")

@app.post("/moderate")
async def moderate(file: UploadFile):
    image = Image.open(io.BytesIO(await file.read())).convert("RGB")
    results = classifier(image)
    top = max(results, key=lambda x: x["score"])
    return {
        "flagged": top["label"] == "nsfw",
        "confidence": round(top["score"], 4),
        "label": top["label"],
    }

@app.get("/health")
async def health():
    return {"status": "ok"}
from fastapi import FastAPI, Request
import deeplake
from PIL import Image
import io
import os
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Pastikan FastAPI membaca dari folder `backend/static/`
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Folder penyimpanan gambar sementara
IMAGE_DIR = os.path.join(STATIC_DIR, "images")
os.makedirs(IMAGE_DIR, exist_ok=True)

@app.get("/dataset")
async def get_dataset(request: Request):
    """Mengambil 3 gambar pertama dari dataset dan menyimpannya sebagai file."""

    # Load dataset
    ds = deeplake.load("hub://activeloop/mura-train")

    # Ambil 3 gambar pertama (index 0, 1, 2) jika tersedia
    image_urls = []
    max_images = min(3, len(ds["images"]))

    for i in range(max_images):
        img_array = ds["images"][i].numpy()
        img_pil = Image.fromarray(img_array)

        # Simpan gambar sebagai file PNG di dalam `backend/static/images/`
        img_path = os.path.join(IMAGE_DIR, f"image_{i}.png")
        img_pil.save(img_path)

        # Gunakan request.base_url agar URL selalu benar
        base_url = str(request.base_url).rstrip("/")
        image_urls.append(f"{base_url}/static/images/image_{i}.png")

    # Informasi dataset
    dataset_info = {
        "path": ds.path,
        "num_samples": len(ds["images"]),
        "tensors": list(ds.tensors.keys()),
        "read_only": ds.read_only
    }

    return {"images": image_urls, "info": dataset_info}

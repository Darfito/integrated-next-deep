from fastapi import FastAPI
import deeplake

app = FastAPI()

# Load dataset sekali saat aplikasi start untuk menghindari load berulang
ds = deeplake.load("hub://activeloop/mura-train")

@app.get("/")
def read_root():
    return {"message": "FastAPI with DeepLake is running!"}

@app.get("/dataset/info")
def get_dataset_info():
    return {
        "path": ds.path,
        "tensors": list(ds.tensors.keys()),  # Menampilkan daftar tensor yang tersedia
        "read_only": ds.read_only
    }

@app.get("/dataset/image_shape")
def get_first_image_shape():
    try:
        shape = ds["images"][0].shape
        return {"image_shape": shape}
    except KeyError:
        return {"error": "Tensor 'images' not found in the dataset"}
    except Exception as e:
        return {"error": str(e)}


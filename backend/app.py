from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from io import BytesIO
from PIL import Image
import numpy as np
import tensorflow as tf

app = FastAPI()
origins = ['*']
app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials = True,
    allow_methods = ['*'],
    allow_headers = ['*']
)

model = tf.keras.models.load_model('./model/cifar_model.h5', custom_objects={'Functional':tf.keras.models.Model})
CIFAR_10_CLASS_NAMES = [ "Airplane", "Automobile", "Bird", "Cat", "Deer", "Dog", "Frog", "Horse", "Ship", "Truck"]

@app.get('/')
async def index():
    return {"hello": "world"}


def read_file_as_image(data, size):
    image = Image.open(BytesIO(data))
    image = image.resize((size, size))
    image = np.array(image)
    return image

@app.post('/predict')
async def predict(file: UploadFile = File(...)):
    image = read_file_as_image(await file.read(), 32)
    img_batch = np.expand_dims(image, 0)
    predictions = model.predict(img_batch)
    prediction_class = CIFAR_10_CLASS_NAMES[np.argmax(predictions)]
    confidence = np.max(predictions[0])
    return {"class": prediction_class, "confidence": float(confidence)*100}


if __name__ == '__main__':
    uvicorn.run(app, host='127.0.0.1', port=8000)
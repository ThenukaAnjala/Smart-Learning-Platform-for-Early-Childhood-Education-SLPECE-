# flask-backend/app.py

from flask import Flask, request, jsonify
from io import BytesIO
from PIL import Image
import base64
import numpy as np
import tensorflow as tf
import os

app = Flask(__name__)

# Path to your trained model
MODEL_PATH = os.path.join(os.getcwd(), "models", "resnet50_quick_draw_finetuned_accurate.h5")

print("Loading model from:", MODEL_PATH)
model = tf.keras.models.load_model(MODEL_PATH)
print("Model loaded successfully.")

labels = ["cat", "dog", "bird", "fish", "elephant", "lion", "giraffe", "rabbit", "cow", "tiger"]

@app.route('/')
def index():
    return "Welcome to the Smart Drawing API! Use POST /predict to classify images."

@app.route('/predict', methods=['POST'])
def predict_drawing():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({'error': 'No image provided'}), 400

    # Extract Base64 (remove "data:image/png;base64," if present)
    image_data = data['image']
    if ',' in image_data:
        image_data = image_data.split(',')[1]

    try:
        # Decode to PIL image
        img = Image.open(BytesIO(base64.b64decode(image_data)))
    except Exception as e:
        return jsonify({'error': f'Invalid image data: {str(e)}'}), 400

    # Convert to grayscale for the model
    img = img.convert('L')
    # Resize to 32x32 (as per your model’s training)
    img = img.resize((32, 32))

    # Scale and expand dims => shape (1, 32, 32, 1)
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=-1)
    img_array = np.expand_dims(img_array, axis=0).astype('float32')

    # Prediction
    preds = model.predict(img_array)
    class_idx = int(np.argmax(preds, axis=1)[0])
    predicted_label = labels[class_idx] if class_idx < len(labels) else 'unknown'

    return jsonify({'label': predicted_label})

if __name__ == '__main__':
    # Listen on 0.0.0.0 so your device or emulator can connect
    app.run(host='0.0.0.0', port=5000, debug=True)

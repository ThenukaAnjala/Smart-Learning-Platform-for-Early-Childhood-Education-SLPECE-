from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
import numpy as np
from PIL import Image
import io
import base64

app = Flask(__name__)

# Load the trained model
model = load_model("resnet50_quick_draw_finetuned_accurate.h5")

# Classes used during training
animal_classes = ['cat', 'dog', 'bird', 'fish', 'elephant', 'lion', 'giraffe', 'rabbit', 'cow', 'tiger']

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if 'image' not in data:
        return jsonify({'error': 'No image data provided'}), 400

    # Decode the base64 image
    image_data = base64.b64decode(data['image'])
    image = Image.open(io.BytesIO(image_data)).convert('L')  # Convert to grayscale

    # Preprocess the image: resize to 32x32 as used during training
    image = image.resize((32, 32))
    image_arr = np.array(image) / 255.0  # Normalize
    image_arr = np.expand_dims(image_arr, axis=-1)  # Shape: (32, 32, 1)
    image_arr = np.expand_dims(image_arr, axis=0)   # Shape: (1, 32, 32, 1)

    # Predict the class
    preds = model.predict(image_arr)
    class_idx = np.argmax(preds[0])
    predicted_class = animal_classes[class_idx]
    confidence = float(preds[0][class_idx])

    return jsonify({
        'predicted_class': predicted_class,
        'confidence': confidence
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

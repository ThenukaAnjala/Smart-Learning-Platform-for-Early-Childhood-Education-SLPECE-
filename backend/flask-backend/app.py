from flask import Flask, request, jsonify
from io import BytesIO
from PIL import Image, ImageOps
import base64
import numpy as np
import tensorflow as tf
import os

app = Flask(__name__)

# Path to your trained ResNet model
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
    # We expect a file upload with key "image"
    if 'image' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['image']

    # 1) Read the file as a PIL image
    try:
        img = Image.open(file)
    except Exception as e:
        return jsonify({'error': f'Invalid image file: {str(e)}'}), 400

    # 2) [Optional] Base64-encode the raw file (if you truly want to store it or something)
    # We'll do it just to illustrate the "encode on backend" step:
    file.seek(0)  # reset file pointer
    encoded = base64.b64encode(file.read()).decode('utf-8')
    # You could store 'encoded' or log it. We'll just keep it here for demonstration.

    # 3) Convert to grayscale
    img = img.convert('L')
    # 4) Threshold: <128 => black, else => white
    img = img.point(lambda p: 0 if p < 128 else 255)
    # 5) Invert if lines are black on white
    if np.array(img).mean() > 128:
        img = ImageOps.invert(img)
    # 6) Resize to match model input (32x32)
    img = img.resize((32, 32))

    # 7) Convert to np array, scale, add channel & batch dimension
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=-1)
    img_array = np.expand_dims(img_array, axis=0).astype('float32')

    # 8) Predict
    preds = model.predict(img_array)
    class_idx = int(np.argmax(preds, axis=1)[0])
    predicted_label = labels[class_idx] if class_idx < len(labels) else 'unknown'

    # Return result
    # If you want to return the base64, you can do so as well: {"label": predicted_label, "base64": encoded}
    return jsonify({'label': predicted_label})

if __name__ == '__main__':
    # Make server visible externally
    app.run(host='0.0.0.0', port=5000, debug=True)

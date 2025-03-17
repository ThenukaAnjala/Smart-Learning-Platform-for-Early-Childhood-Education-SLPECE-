# backend/flask-backend/app.py
from flask import Flask, request, jsonify
from io import BytesIO
from PIL import Image, ImageOps
import base64
import numpy as np
import tensorflow as tf
import os
import logging

app = Flask(__name__)

# Setup logging for debugging.
logging.basicConfig(level=logging.DEBUG)

# Path to your trained model
MODEL_PATH = os.path.join(os.getcwd(), "models", "resnet50_quick_draw_finetuned_accurate.h5")
logging.debug("Loading model from: %s", MODEL_PATH)
model = tf.keras.models.load_model(MODEL_PATH)
logging.debug("Model loaded successfully.")

labels = ["cat", "dog", "bird", "fish", "elephant", "lion", "giraffe", "rabbit", "cow", "tiger"]

@app.route('/')
def index():
    return "Welcome to the Smart Drawing API! Use POST /predict to classify images."

@app.route('/predict', methods=['POST'])
def predict_drawing():
    # Ensure the request has a file.
    if 'image' not in request.files:
        logging.error("No file provided in the request.")
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['image']

    try:
        img = Image.open(file)
    except Exception as e:
        logging.exception("Failed to open image file.")
        return jsonify({'error': f'Invalid image file: {str(e)}'}), 400

    # Log original image mode and size for debugging.
    logging.debug("Original image mode: %s, size: %s", img.mode, img.size)

    # Convert to grayscale (L mode) so we have one channel.
    gray_img = img.convert('L')
    # Apply thresholding: pixels below 128 become black (0), else white (255)
    thresh_img = gray_img.point(lambda p: 0 if p < 128 else 255)
    # Optionally invert the image if the average is high (i.e., if it's mostly white).
    if np.array(thresh_img).mean() > 128:
        thresh_img = ImageOps.invert(thresh_img)
    
    # Log the processed image mean pixel value.
    logging.debug("Processed image mean: %.2f", np.array(thresh_img).mean())

    # Resize to the expected model input size (32x32).
    resized_img = thresh_img.resize((32, 32))
    # Log the resized image size.
    logging.debug("Resized image size: %s", resized_img.size)

    # Convert to a NumPy array, scale pixels to [0, 1], and add channel and batch dimensions.
    img_array = np.array(resized_img) / 255.0
    logging.debug("Image array shape after conversion: %s", img_array.shape)
    img_array = np.expand_dims(img_array, axis=-1)  # now shape is (32,32,1)
    img_array = np.expand_dims(img_array, axis=0).astype('float32')  # now shape is (1,32,32,1)

    # Log final shape before prediction.
    logging.debug("Final image array shape: %s", img_array.shape)

    try:
        preds = model.predict(img_array)
    except Exception as e:
        logging.exception("Model prediction failed.")
        return jsonify({'error': f'Model prediction error: {str(e)}'}), 500

    class_idx = int(np.argmax(preds, axis=1)[0])
    predicted_label = labels[class_idx] if class_idx < len(labels) else 'unknown'

    # Optionally, log prediction probabilities.
    logging.debug("Prediction probabilities: %s", preds)

    # Remove white background from original image: convert all non-white to white.
    original_rgba = img.convert("RGBA")
    datas = original_rgba.getdata()
    newData = []
    for item in datas:
        # If the pixel is nearly white, set its alpha to 0.
        if item[0] > 230 and item[1] > 230 and item[2] > 230:
            newData.append((255, 255, 255, 0))
        else:
            # Otherwise, force the pixel color to white.
            newData.append((255, 255, 255, item[3]))
    original_rgba.putdata(newData)

    buffer = BytesIO()
    original_rgba.save(buffer, format='PNG')
    processed_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

    return jsonify({'label': predicted_label, 'processedBase64': processed_base64})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

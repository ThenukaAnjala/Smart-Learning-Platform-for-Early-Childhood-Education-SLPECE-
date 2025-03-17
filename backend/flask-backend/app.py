# backend/flask-backend/app.py
from flask import Flask, request, jsonify
from io import BytesIO
from PIL import Image, ImageOps
import base64
import numpy as np
import tensorflow as tf
import os
import logging
from quickdraw import QuickDrawData  # Using the unofficial Quick Draw API package

app = Flask(__name__)

# Setup logging for debugging.
logging.basicConfig(level=logging.DEBUG)

# Path to your trained model
MODEL_PATH = os.path.join(os.getcwd(), "models", "resnet50_quick_draw_finetuned_accurate.h5")
logging.debug("Loading model from: %s", MODEL_PATH)
model = tf.keras.models.load_model(MODEL_PATH)
logging.debug("Model loaded successfully.")

# The list of labels corresponding to the 10 animal classes.
labels = ["cat", "dog", "bird", "fish", "elephant", "lion", "giraffe", "rabbit", "cow", "tiger"]

def preprocess_image(img):
    """
    Preprocess the input PIL image for model prediction:
      - Convert to grayscale (L mode)
      - Apply thresholding (pixels below 128 become 0, else 255)
      - Invert if the image is mostly white
      - Resize to the expected input size (32x32)
      - Normalize pixel values to [0,1] and add batch/channel dimensions
    """
    # Convert to grayscale
    gray_img = img.convert('L')
    # Apply thresholding: below 128 → black, else white
    thresh_img = gray_img.point(lambda p: 0 if p < 128 else 255)
    # Invert the image if its mean is high (i.e. mostly white)
    if np.array(thresh_img).mean() > 128:
        thresh_img = ImageOps.invert(thresh_img)
    logging.debug("Processed image mean: %.2f", np.array(thresh_img).mean())
    # Resize to 32x32 (adjust if your model expects a different size)
    resized_img = thresh_img.resize((32, 32))
    logging.debug("Resized image size: %s", resized_img.size)
    # Convert to NumPy array and normalize to [0,1]
    img_array = np.array(resized_img) / 255.0
    logging.debug("Image array shape after conversion: %s", img_array.shape)
    # Add channel dimension (since image is grayscale) and batch dimension
    img_array = np.expand_dims(img_array, axis=-1)  # (32,32,1)
    img_array = np.expand_dims(img_array, axis=0).astype('float32')  # (1,32,32,1)
    logging.debug("Final image array shape: %s", img_array.shape)
    return img_array

def remove_white_background(img):
    """
    Remove the white background from a PIL image by setting near-white pixels transparent.
    Returns the processed image as a base64-encoded PNG.
    """
    original_rgba = img.convert("RGBA")
    datas = original_rgba.getdata()
    newData = []
    for item in datas:
        # If the pixel is nearly white, set its alpha to 0 (transparent)
        if item[0] > 230 and item[1] > 230 and item[2] > 230:
            newData.append((255, 255, 255, 0))
        else:
            newData.append((255, 255, 255, item[3]))
    original_rgba.putdata(newData)
    buffer = BytesIO()
    original_rgba.save(buffer, format='PNG')
    processed_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    return processed_base64

@app.route('/')
def index():
    return "Welcome to the Smart Drawing API! Use POST /predict for uploaded images or GET /predict_quickdraw to fetch a drawing from Quick Draw."

@app.route('/predict', methods=['POST'])
def predict_drawing():
    # Ensure the request contains an 'image' file.
    if 'image' not in request.files:
        logging.error("No file provided in the request.")
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['image']

    try:
        img = Image.open(file)
    except Exception as e:
        logging.exception("Failed to open image file.")
        return jsonify({'error': f'Invalid image file: {str(e)}'}), 400

    # Preprocess the image and predict.
    img_array = preprocess_image(img)
    try:
        preds = model.predict(img_array)
    except Exception as e:
        logging.exception("Model prediction failed.")
        return jsonify({'error': f'Model prediction error: {str(e)}'}), 500

    class_idx = int(np.argmax(preds, axis=1)[0])
    predicted_label = labels[class_idx] if class_idx < len(labels) else 'unknown'
    logging.debug("Prediction probabilities: %s", preds)

    # Postprocess the original image for display (remove white background).
    processed_base64 = remove_white_background(img)
    return jsonify({'label': predicted_label, 'processedBase64': processed_base64})

@app.route('/predict_quickdraw', methods=['GET'])
def predict_quickdraw():
    """
    Fetches a drawing from the Google Quick Draw API based on a query parameter 'word'
    and classifies it using the trained model.
    """
    # Get the word to fetch from the query parameters; default to 'cat'
    word = request.args.get('word', 'cat')
    logging.debug("Fetching Quick Draw drawing for word: %s", word)
    try:
        qdraw = QuickDrawData()
        drawing = qdraw.get_drawing(word)
        # Convert the drawing to a PIL image (assuming the drawing object has an 'image' attribute)
        img = drawing.image
    except Exception as e:
        logging.exception("Failed to fetch drawing from Quick Draw API.")
        return jsonify({'error': f'Failed to fetch drawing: {str(e)}'}), 500

    # Preprocess the fetched image and predict.
    img_array = preprocess_image(img)
    try:
        preds = model.predict(img_array)
    except Exception as e:
        logging.exception("Model prediction failed.")
        return jsonify({'error': f'Model prediction error: {str(e)}'}), 500

    class_idx = int(np.argmax(preds, axis=1)[0])
    predicted_label = labels[class_idx] if class_idx < len(labels) else 'unknown'
    logging.debug("Prediction probabilities: %s", preds)
    
    # Postprocess the drawing for display.
    processed_base64 = remove_white_background(img)
    return jsonify({'label': predicted_label, 'processedBase64': processed_base64})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

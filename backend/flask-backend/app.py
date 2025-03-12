from flask import Flask, request, jsonify
from io import BytesIO
from PIL import Image, ImageOps
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
    if 'image' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['image']

    # 1) Open the file as a PIL image
    try:
        img = Image.open(file)
    except Exception as e:
        return jsonify({'error': f'Invalid image file: {str(e)}'}), 400

    # 2) Convert to grayscale for recognition
    gray_img = img.convert('L')

    # 3) Threshold + invert if needed for your model
    thresh_img = gray_img.point(lambda p: 0 if p < 128 else 255)
    if np.array(thresh_img).mean() > 128:
        thresh_img = ImageOps.invert(thresh_img)

    # 4) Resize for the model
    thresh_img = thresh_img.resize((32, 32))
    arr = np.array(thresh_img) / 255.0
    arr = np.expand_dims(arr, axis=-1)
    arr = np.expand_dims(arr, axis=0).astype('float32')

    # 5) Predict
    preds = model.predict(arr)
    class_idx = int(np.argmax(preds, axis=1)[0])
    predicted_label = labels[class_idx] if class_idx < len(labels) else 'unknown'

    # 6) Now remove white background from original image (not just threshold)
    #    We'll assume "white" is near 255,255,255, so we create an RGBA copy
    #    and set white pixels to transparent.
    #    This ensures the final image has just the lines (no bounding box).
    original_rgba = img.convert("RGBA")
    datas = original_rgba.getdata()
    newData = []
    for item in datas:
        # item is (r,g,b,a)
        # If r,g,b is close to white, set alpha=0
        # Tweak tolerance if needed (like if item[:3] == (255,255,255))
        if item[0] > 230 and item[1] > 230 and item[2] > 230:
            # turn this pixel transparent
            newData.append((255,255,255,0))
        else:
            newData.append(item)
    original_rgba.putdata(newData)

    # 7) Convert the final RGBA (with white removed) to base64
    buffer = BytesIO()
    original_rgba.save(buffer, format='PNG')
    processed_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

    # Return the recognized label + the processed image
    return jsonify({
        'label': predicted_label,
        'processedBase64': processed_base64
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

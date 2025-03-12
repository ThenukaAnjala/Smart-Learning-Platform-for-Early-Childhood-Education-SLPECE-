from flask import Flask, request, jsonify
import torch
from torchvision import models, transforms
from PIL import Image
import torch.nn as nn
import os
import traceback
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Device setup
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Using device: {device}")

# Load model
def load_model(checkpoint_path, device):
    try:
        checkpoint = torch.load(checkpoint_path, map_location=device)
        classes = checkpoint.get('classes', [])
        if not classes:
            raise ValueError("No classes found in checkpoint")
        
        num_classes = len(classes)
        model = models.vgg16(pretrained=False)
        
        # Freeze feature layers
        for param in model.features.parameters():
            param.requires_grad = False
        
        # Custom classifier
        model.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(25088, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(512, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Linear(256, num_classes),
        )
        
        model.load_state_dict(checkpoint['model_state_dict'])
        model.to(device)
        model.eval()
        print(f"Model loaded with {num_classes} classes: {classes}")
        return model, classes
    except Exception as e:
        print(f"Error loading model: {e}")
        traceback.print_exc()
        return None, None

# Model path
model_path = os.path.join(os.getcwd(), 'animal_recognition_model.pth')
print(f"Model path: {model_path}, Exists: {os.path.exists(model_path)}")
model, classes = load_model(model_path, device)

# Image transformation
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200
    
    if model is None or not classes:
        return jsonify({'error': 'Model not loaded'}), 500
    
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    try:
        image_file = request.files['image']
        image = Image.open(image_file).convert('RGB')
        
        # Preprocess
        input_tensor = transform(image).unsqueeze(0).to(device)
        
        # Predict
        with torch.no_grad():
            output = model(input_tensor)
            probabilities = torch.nn.functional.softmax(output, dim=1)
            predicted_idx = probabilities.argmax(dim=1).item()
            confidence = probabilities[0, predicted_idx].item() * 100
        
        predicted_class = classes[predicted_idx]
        return jsonify({
            'prediction': predicted_class,
            'confidence': round(confidence, 2),
        })
    except Exception as e:
        print(f"Prediction error: {e}")
        traceback.print_exc()
        return jsonify({'error': f"Processing failed: {str(e)}"}), 500

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({'message': 'Server running'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050, debug=True)

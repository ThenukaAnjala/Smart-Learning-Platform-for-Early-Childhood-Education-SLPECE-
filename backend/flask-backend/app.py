from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib

app = Flask(__name__)
CORS(app)

model = joblib.load('model/model.pkl')  # Load your trained model

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    prediction = model.predict([data['input']])
    return jsonify({'result': prediction.tolist()})

if __name__ == '__main__':
    app.run(debug=True, port=5000)

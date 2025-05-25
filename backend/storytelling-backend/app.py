from flask import Flask, send_from_directory
from flask_cors import CORS
import os
from routes.routes import story_bp  # Ensure this import is correct

app = Flask(__name__)
CORS(app)  # Allow frontend requests

# Define static folder path
STATIC_FOLDER = os.path.join(os.getcwd(), "static")

# Ensure static folder exists
if not os.path.exists(STATIC_FOLDER):
    os.makedirs(STATIC_FOLDER)

# Register the route blueprint
app.register_blueprint(story_bp)

# Serve static files route
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory(STATIC_FOLDER, filename)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True, threaded=True)

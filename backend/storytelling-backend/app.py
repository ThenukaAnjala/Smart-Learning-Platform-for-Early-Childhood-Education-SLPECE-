from flask import Flask, send_from_directory
from flask_cors import CORS
import os
from routes.routes import app as routes_blueprint  # Import Blueprint from routes.py

try:
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all routes and origins

    # Static folder creation for static files
    STATIC_FOLDER = "static"
    if not os.path.exists(STATIC_FOLDER):
        os.makedirs(STATIC_FOLDER)

    # Register the route blueprint
    app.register_blueprint(routes_blueprint, url_prefix='/api')  # Correct Blueprint name

    # Serve static files route
    @app.route('/static/<path:filename>')
    def serve_static(filename):
        return send_from_directory(STATIC_FOLDER, filename)
    
except Exception as e:
    print(f"Error starting app: {e}")
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
    


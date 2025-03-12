from flask import Blueprint, request, jsonify
from controllers.storyController import generate_story

# Create a Blueprint
# app = Blueprint('app', __name__)
story_bp = Blueprint('story_bp', __name__, url_prefix='/story')

@story_bp.route('/generate-story', methods=['POST'])
def generate_story_handler():
    # Call the controller function to process the story
    return generate_story()

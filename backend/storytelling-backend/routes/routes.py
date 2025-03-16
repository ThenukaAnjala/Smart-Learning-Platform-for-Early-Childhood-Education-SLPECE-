from flask import Blueprint, request, jsonify
from controllers.storyController import generate_story, analyze_story

# Create a Blueprint
# app = Blueprint('app', __name__)
story_bp = Blueprint('story_bp', __name__, url_prefix='/story')

@story_bp.route('/generate-story', methods=['POST'])
def generate_story_handler():
    # Generate the story
    story_response = generate_story()
    
    # If response is a tuple (error response)
    if isinstance(story_response, tuple):
        return story_response
    
    # Extract JSON data from response
    story_data = story_response.get_json()
    
    if "story" not in story_data:
        return jsonify({"error": "Story generation failed"}), 500

    story_text = story_data["story"]  # Extract the generated story text
    segments = story_data.get("segments", [])  # Extract the segments

    # Analyze the story for mood, category, and subcategory
    mood, category, subcategory = analyze_story(story_text)

    # Return combined response WITH segments
    return jsonify({
        "story": story_text,
        "segments": segments,  # Include segments here
        "mood": mood,
        "category": category,
        "subcategory": subcategory
    })

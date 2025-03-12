from flask import request, jsonify
from services.image_generator import generate_image
from services.tts import generate_tts

def segment_story_by_sentences(story_text):
    """
    Segments a story dynamically into 2-sentence or 3-sentence segments based on word count.
    """
    # Split story into words and filter out short words
    words = story_text.split()
    filtered_words = [word for word in words if len(word) > 2]

    # Total word count after filtering
    total_word_count = len(filtered_words)

    # Split the story into sentences
    sentences = story_text.split(". ")
    total_sentences = len(sentences)

    # Determine sentences per segment
    sentences_per_segment = 2 if total_word_count <= 100 else 3

    # Create segments
    segments = []
    for i in range(0, total_sentences, sentences_per_segment):
        segment = ". ".join(sentences[i:i + sentences_per_segment])
        if not segment.endswith("."):
            segment += "."
        segments.append(segment)

    return segments

def generate_story():
    data = request.json
    story_prompt = data.get("story_prompt", "")
    voice = data.get("voice", "default")

    if not story_prompt:
        return jsonify({"error": "Story prompt is required"}), 400

    # Segment the story
    story_segments = segment_story_by_sentences(story_prompt)

    # Generate images and TTS audio
    results = []
    for segment in story_segments:
        # image_url = generate_image(segment)
        image_url = ""
        audio_url = generate_tts(segment, voice)
        results.append({"text": segment, "image_url": image_url, "audio_url": audio_url})

    return jsonify({"story_parts": results})

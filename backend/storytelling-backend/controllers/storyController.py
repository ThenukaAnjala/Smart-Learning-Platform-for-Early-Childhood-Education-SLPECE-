# import openai
# import os
# import json
# from flask import request, jsonify
# from services.image_generator import generate_image
# from services.tts import generate_tts
# from dotenv import load_dotenv

# # Load environment variables
# load_dotenv()
# OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# def segment_story_by_sentences(story_text):
#     """
#     Segments a story dynamically into 2-sentence or 3-sentence segments based on word count.
#     """
#     # Clean up the text by ensuring proper spacing after periods
#     story_text = story_text.replace(".", ". ").replace("  ", " ").strip()
    
#     words = story_text.split()
#     filtered_words = [word for word in words if len(word) > 2]
#     total_word_count = len(filtered_words)

#     # Split by periods followed by spaces to properly identify sentence boundaries
#     sentences = [s.strip() for s in story_text.split(". ")]
#     # Remove any empty sentences that might have been created by the split
#     sentences = [s for s in sentences if s]
#     total_sentences = len(sentences)

#     sentences_per_segment = 2 if total_word_count <= 100 else 3
#     segments = []

#     for i in range(0, total_sentences, sentences_per_segment):
#         segment_sentences = sentences[i:i + sentences_per_segment]
#         # Add periods back to the end of each sentence
#         segment = ". ".join(segment_sentences)
#         if not segment.endswith("."):
#             segment += "."
#         segments.append(segment)

#     return segments

# def process_story(story_text):
#     """
#     Process user's story while preserving original segments exactly
#     Returns: Original segments + images + proper category analysis
#     """
#     try:
#         # 1. Preserve original segments
#         original_segments = segment_story_by_sentences(story_text)
        
#         # 2. Analyze story for category/mood (for image context only)
#         category_info = analyze_story(story_text)
        
#         # 3. Generate images using original segments
#         results = []
#         for segments in original_segments:
#             image_url = generate_image(
#                 segment=segments,
#                 main_category=category_info['main_category'],
#                 sub_category=category_info['sub_category']
#             )
#             results.append({
#                 "original_text": segments,  # Unmodified original text
#                 "image_url": image_url,
#                 "audio_url": ""  # Add your TTS logic here
#             })

#         return {
#             "original_story": story_text,
#             "segments": results,
#             "category_info": {
#                 "main_category": category_info['main_category'],
#                 "sub_category": category_info['sub_category'],
#                 "confidence": category_info['confidence']
#             }
#         }

#     except Exception as e:
#         print(f"Processing error: {e}")
#         return {"error": str(e)}

# def generate_story():
#     """
    
#     Preserves original story segments.
#     """
#     data = request.json
#     story_prompt = data.get("story_prompt", "")

#     # Ensure API key is set
#     if not OPENAI_API_KEY:
#         return jsonify({"error": "Missing OpenAI API Key"}), 500

#     # prompt = f"Generate a short children's story based on this prompt: {story_prompt}"

#     try:
#         client = openai.OpenAI(api_key=OPENAI_API_KEY)

#          # Generate original story
#         response = client.chat.completions.create(
#             model="gpt-4",
#             messages=[{
#                 "role": "user", 
#                 "content": 
#                            f"Don not change anything, sent the original story prompt: {story_prompt}"
                          
#             }]
#         )

#         # response = client.chat.completions.create(
#         #     model="gpt-4",
#         #     messages=[{"role": "user", "content": prompt}]
#         # )

#         story_text = response.choices[0].message.content

#         # Segment the story
#         story_segments = segment_story_by_sentences(story_text)

#         results = []
#         for segment in story_segments:
#             # image_url = generate_image(segment)
#             image_url = ""
#             # audio_url = generate_tts(segment, "default_voice")
#             audio_url = ""
#             results.append({"text": segment, "image_url": image_url, "audio_url": audio_url})

#         return jsonify({
#             "story": story_text,
#             "segments": results
#         })

#     except Exception as e:
#         print(f"Error generating story: {e}")
#         return jsonify({"error": "Failed to generate story"}), 500

# def analyze_story(story_text):
#     """
#     Analyzes a story to select the most appropriate category/subcategory from the predefined list
#     Returns: Dict with selected category and subcategory
#     """
#     category_prompt = f"""Analyze this children's story and select the MOST relevant combination from these categories:
    
#     [MAIN CATEGORIES AND SUBCATEGORIES]
#     1. Magical Adventure:
#         - Enchanted Forest
#         - Wizard's Tower
#         - Fairy Village
#     2. Bedtime Story:
#         - Starry Night
#         - Cozy Bedroom
#         - Dreamland
#     3. Pirate Adventure:
#         - Pirate Ship
#         - Treasure Island
#         - Stormy Seas
#     4. Space Exploration:
#         - Alien Planet
#         - Space Station
#         - Rocket Launch
#     5. Farm Life:
#         - Barnyard
#         - Harvest Time
#         - Farmer's Market
#     6. Fairy Tale:
#         - Royal Castle
#         - Enchanted Garden
#         - Dragon's Lair
#     7. Jungle Expedition:
#         - Rainforest
#         - River Adventure
#         - Hidden Temple
#     8. Underwater Adventure:
#         - Coral Reef
#         - Sunken Ship
#         - Deep Sea
#     9. Dinosaur Era:
#         - Dinosaur Valley
#         - Volcanic Eruption
#         - Fossil Dig
#     10. Superhero Mission:
#         - City Rescue
#         - Secret Lair
#         - Villain's Hideout

    

#     Return JSON format with:
#     - main_category: The main category name exactly as listed
#     - sub_category: The subcategory name exactly as listed
#     - confidence: Your confidence level (1-5)
    
#     Example Response:
#     {{
#         "main_category": "Fairy Tale",
#         "sub_category": "Enchanted Garden",
#         "confidence": 4
#     }}"""

#     try:
#         client = openai.OpenAI(api_key=OPENAI_API_KEY)
#         response = client.chat.completions.create(
#             model="gpt-4",
#             messages=[{"role": "user", "content": category_prompt}]
#         )
        
#         result = json.loads(response.choices[0].message.content)
        
#         # Validate response format
#         if not all(key in result for key in ["main_category", "sub_category", "confidence"]):
#             raise ValueError("Invalid response format")
            
#         return result
    
#     except Exception as e:
#         print(f"Category analysis error: {e}")
#         # Return default safe category for children
#         return {
#             "main_category": "Fairy Tale",
#             "sub_category": "Enchanted Garden",
#             "confidence": 0
#         }



import openai
import os
import json
from flask import request, jsonify
from services.image_generator import generate_image
from services.tts import generate_tts
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def segment_story_by_sentences(story_text):
    """
    Segments a story dynamically into 2-sentence or 3-sentence segments based on word count.
    """
    # Clean up the text by ensuring proper spacing after periods
    story_text = story_text.replace(".", ". ").replace("  ", " ").strip()
    
    words = story_text.split()
    filtered_words = [word for word in words if len(word) > 2]
    total_word_count = len(filtered_words)

    # Split by periods followed by spaces to properly identify sentence boundaries
    sentences = [s.strip() for s in story_text.split(". ")]
    # Remove any empty sentences that might have been created by the split
    sentences = [s for s in sentences if s]
    total_sentences = len(sentences)

    sentences_per_segment = 2 if total_word_count <= 100 else 3
    segments = []

    for i in range(0, total_sentences, sentences_per_segment):
        segment_sentences = sentences[i:i + sentences_per_segment]
        # Add periods back to the end of each sentence
        segment = ". ".join(segment_sentences)
        if not segment.endswith("."):
            segment += "."
        segments.append(segment)
        

    return segments

def generate_story():
    """
    use original prompt, segments it only 3 segment, generates images.
    """
    data = request.json
    story_prompt = data.get("story_prompt", "")

    # Ensure API key is set
    if not OPENAI_API_KEY:
        return jsonify({"error": "Missing OpenAI API Key"}), 500

    prompt = f"use original prompt, do not change story: {story_prompt}"

    try:
        client = openai.OpenAI(api_key=OPENAI_API_KEY)

        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )

        story_text = response.choices[0].message.content

        # Segment the story
        story_segments = segment_story_by_sentences(story_prompt)

        results = []
        for segment in story_segments:
            image_url = generate_image(segment)
            # audio_url = generate_tts(segment, "default_voice")
            audio_url = ""
            results.append({"text": segment, "image_url": image_url, "audio_url": audio_url})

        return jsonify({
            "story": story_prompt,
            "segments": results
        })

    except Exception as e:
        print(f"Error generating story: {e}")
        return jsonify({"error": "Failed to generate story"}), 500

def analyze_story(story_text):
    """
    Sends the full story to ChatGPT to determine mood, category, and subcategory.
    """
    prompt = (
        f"Analyze the following story and determine the most suitable mood, category, "
        f"and subcategory from the provided list. The mood should reflect the overall "
        f"emotional tone of the story (either 'happy' or 'sad'). The category and subcategory "
        f"should be chosen based on the story’s theme, setting, and key elements.\n\n"
        f"### Category List ###\n"
        f"City Life  (Busy Street, City Market, School)"
	    f"Fairy Tale  (Dragon's Lair, Enchanted Garden, Royal Castle)"
	    f"Farm Life  (Barnyard, Harvest Time, Farmer's Market)"
	    f"Jungle Expedition  (Happy Summer, jungle explore, River Adventure)"
	    f"Magical Adventure  (Enchanted Forest, Wizard's Tower, Fairy Village)"
	    f"night sky  (calm)"
	    f"Pirate Adventure  (Pirate Ship, Treasure Island, Stormy Seas)"
	    f"Underwater Adventure  (Underwater Adventure)"

        # f"- Farm Life\n  - Barnyard\n  - Farmer's Market\n  - Harvest Time\n\n"
        f"### Story ###\n{story_text}\n\n"
        f"Return the result in JSON format:\n"
        f'{{"mood": "...", "category": "...", "subcategory": "..."}}'
    )

    try:
        client = openai.OpenAI(api_key=OPENAI_API_KEY)

        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )

        content = response.choices[0].message.content

        # Parse JSON safely
        try:
            analysis = json.loads(content)
        except json.JSONDecodeError:
            print("Error parsing AI response as JSON.")
            return "unknown", "unknown", "unknown"

        return analysis.get("mood", "unknown"), analysis.get("category", "unknown"), analysis.get("subcategory", "unknown")

    except Exception as e:
        print(f"Error analyzing story: {e}")
        return "unknown", "unknown", "unknown"
    
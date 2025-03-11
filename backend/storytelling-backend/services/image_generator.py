import openai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_image(prompt):
    """
    Generates an image for a given prompt using OpenAI's DALL-E API.
    """
    response = openai.Image.create(prompt=prompt, n=1, size="512x512")
    return response["data"][0]["url"]

from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")  # Safely pulls from .env
)

def generate_image(prompt):
    """
    Generates an image for a given prompt using OpenAI's DALL-E API.
    """
    formatted_prompt = f"Generate a child-friendly illustration for a story segment intended for children aged 4-8.: {prompt}"  # Modify prompt here
    
    try:
        response = client.images.generate(prompt=formatted_prompt, n=1, size="512x512")
        return response.data[0].url
    except Exception as e:
        print(f"Error generating image: {e}")
        return "https://placehold.co/512x512/png?text=Image+Generation+Failed"  # Fallback image URL
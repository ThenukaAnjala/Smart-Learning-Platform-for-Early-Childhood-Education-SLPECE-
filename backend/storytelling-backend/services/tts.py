import os
import uuid
from gtts import gTTS

STATIC_FOLDER = "static"
if not os.path.exists(STATIC_FOLDER):
    os.makedirs(STATIC_FOLDER)

def generate_tts(text, voice):
    """
    Generates TTS audio for a given text.
    """
    tts = gTTS(text=text, lang="en")
    filename = f"{STATIC_FOLDER}/{uuid.uuid4()}.mp3"
    tts.save(filename)
    return f"/static/{os.path.basename(filename)}"

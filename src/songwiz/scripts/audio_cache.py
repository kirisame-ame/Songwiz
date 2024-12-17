import os
import sys
import musicWav
sys.stderr = open(os.devnull, 'w')
if __name__ == "__main__":
    audio_dir = sys.argv[1]
    cache_dir = sys.argv[2]
    musicWav.cache_audio_features(audio_dir, cache_dir)

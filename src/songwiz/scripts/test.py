import sys
import json

if __name__ == "__main__":
    num = sys.argv[1]
    num2 = sys.argv[2]
    print(json.dumps({'similar_images': [num, num2]}))

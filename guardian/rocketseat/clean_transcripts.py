import os
import re

input_dir = 'c:/Users/LENOVO/Desktop/guardian/rocketseat'
out_file = 'c:/Users/LENOVO/Desktop/guardian/rocketseat/all_cleaned.txt'

with open(out_file, 'w', encoding='utf-8') as out:
    for filename in os.listdir(input_dir):
        if filename.endswith('.txt') and filename != 'all_cleaned.txt':
            filepath = os.path.join(input_dir, filename)
            out.write(f"\n\n=== FILE: {filename} ===\n\n")
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
            except UnicodeDecodeError:
                with open(filepath, 'r', encoding='latin-1') as f:
                    lines = f.readlines()
                    
            cleaned = []
            for line in lines:
                line = line.strip()
                if re.match(r'^\d{2}:\d{1,2}(\.\d+)?$', line) or line == 'Transcrição':
                    continue
                if line:
                    cleaned.append(line)
            
            # create dense paragraphs
            out.write(' '.join(cleaned))
            
print("Cleaning complete.")

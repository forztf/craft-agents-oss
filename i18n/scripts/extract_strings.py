import os
import re
import json
from pathlib import Path

# Configuration
PROJECT_ROOT = os.getcwd()
Apps_Renderer = os.path.join(PROJECT_ROOT, "apps", "electron", "src", "renderer")

SOURCE_MAPPING = {
    "pages": os.path.join(Apps_Renderer, "pages"),
    "components": os.path.join(Apps_Renderer, "components"),
}

IGNORE_DIRS = {"__tests__", "test", "spec", "tests", "node_modules"}
IGNORE_EXTENSIONS = {".test.tsx", ".spec.tsx", ".d.ts", ".test.ts", ".spec.ts"}

# Regex for extraction
# 1. JSX Text: >Text<
# Captures text between tags. Excludes lines that are just brace expressions or empty.
JSX_TEXT_RE = re.compile(r">([^<{}\n]+)<")

# 2. String Attributes
# Captures common UI attributes.
ATTR_KEYS = ["title", "placeholder", "alt", "label", "aria-label", "description", "heading", "text"]
ATTR_RE = re.compile(r'\b(' + '|'.join(ATTR_KEYS) + r')\s*=\s*"([^"]+)"')

def should_ignore(filename):
    if not (filename.endswith(".tsx") or filename.endswith(".ts")):
        return True
    for ext in IGNORE_EXTENSIONS:
        if filename.endswith(ext):
            return True
    return False

def extract_from_content(content):
    strings = set()
    
    # JSX Text
    for match in JSX_TEXT_RE.finditer(content):
        text = match.group(1).strip()
        # Filter out common false positives
        if not text: continue
        if text.startswith("{") and text.endswith("}"): continue # Likely expression
        if len(text) < 2: continue # Single chars might be symbols
        if re.match(r'^[0-9]+$', text): continue # Skip pure numbers
        if re.match(r'^[^\w\s]+$', text): continue # Skip pure symbols like " | "
        
        strings.add(text)
            
    # Attributes
    for match in ATTR_RE.finditer(content):
        text = match.group(2).strip()
        if text and len(text) > 1:
            strings.add(text)
            
    return sorted(list(strings))

def main():
    print(f"Starting extraction form {Apps_Renderer}...")
    count = 0
    
    for category, src_dir in SOURCE_MAPPING.items():
        if not os.path.exists(src_dir):
            print(f"Warning: {src_dir} does not exist.")
            continue
            
        for root, dirs, files in os.walk(src_dir):
            # Modify dirs in-place to ignore
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            
            for file in files:
                if should_ignore(file):
                    continue
                    
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                except Exception as e:
                    print(f"Error reading {filepath}: {e}")
                    continue
                
                extracted = extract_from_content(content)
                
                if extracted:
                    # Calculate relative path to preserve structure
                    # e.g. root = .../pages/settings, src_dir = .../pages
                    # rel = settings
                    rel_dir = os.path.relpath(root, src_dir)
                    if rel_dir == ".":
                        rel_dir = ""
                        
                    base_name = os.path.splitext(file)[0]
                    
                    # Target Path
                    # locales/en/{category}/{rel_dir}/{base_name}.json
                    
                    target_rel_path = os.path.join(category, rel_dir, f"{base_name}.json")
                    
                    # Generate EN
                    en_file = Path(PROJECT_ROOT) / "locales" / "en" / target_rel_path
                    en_file.parent.mkdir(parents=True, exist_ok=True)
                    
                    data_en = {s: s for s in extracted}
                    
                    with open(en_file, 'w', encoding='utf-8') as f:
                        json.dump(data_en, f, indent=2, ensure_ascii=False)
                        
                    # Generate ZH-CN (Copy EN for now)
                    cn_file = Path(PROJECT_ROOT) / "locales" / "zh-CN" / target_rel_path
                    cn_file.parent.mkdir(parents=True, exist_ok=True)
                    
                    with open(cn_file, 'w', encoding='utf-8') as f:
                        json.dump(data_en, f, indent=2, ensure_ascii=False)
                        
                    count += 1
                    print(f"Generated {target_rel_path} ({len(extracted)} keys)")

    print(f"Extraction complete. Processed {count} files.")

if __name__ == "__main__":
    main()

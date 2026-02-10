import os
import json

def main():
    unique_keys = set()
    root_dir = "locales/en"
    
    for subdir, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith(".json"):
                path = os.path.join(subdir, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        unique_keys.update(data.keys())
                except Exception as e:
                    print(f"Error reading {path}: {e}")

    output_file = "all_keys.json"
    with open(output_file, "w", encoding='utf-8') as f:
        json.dump(sorted(list(unique_keys)), f, indent=2, ensure_ascii=False)
    
    print(f"Extracted {len(unique_keys)} keys to {output_file}")

if __name__ == "__main__":
    main()

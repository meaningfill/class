import zipfile
import os
import sys
import shutil

def extract_zip(zip_path, extract_to):
    print(f"Extracting {zip_path} to {extract_to}...")
    
    if not os.path.exists(extract_to):
        os.makedirs(extract_to)

    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            # zip_ref.extractall(extract_to) 
            # extractall might fail with encoding issues on filenames
            # Let's iterate and extract manually, fixing names if needed?
            # AI Hub often uses cp949 for filenames in zip
            
            for file_info in zip_ref.infolist():
                # Try to decode filename if it's garbled
                try:
                    # Default is cp437 for zip, AI Hub often uses euc-kr/cp949
                    # But Python zipfile usually handles it if flag is set, or we might need manual fix
                    filename = file_info.filename
                    
                    # AI Hub nesting specific check
                    if file_info.is_dir():
                        continue
                        
                    # Extract
                    target_path = os.path.join(extract_to, filename)
                    
                    # Ensure dir exists
                    os.makedirs(os.path.dirname(target_path), exist_ok=True)
                    
                    with zip_ref.open(file_info) as source, open(target_path, "wb") as target:
                        shutil.copyfileobj(source, target)
                        
                except Exception as e:
                    print(f"Error extracting {file_info.filename}: {e}")
                    
        print("Extraction complete.")
        
    except zipfile.BadZipFile:
        print("Error: Bad Zip File")
        sys.exit(1)
    except Exception as e:
        print(f"Fatal Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python extract_zip.py <zip_path> <extract_to>")
        sys.exit(1)
        
    extract_zip(sys.argv[1], sys.argv[2])

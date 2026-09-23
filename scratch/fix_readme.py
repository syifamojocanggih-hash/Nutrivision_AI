import sys

def main():
    try:
        with open('README.md', 'r', encoding='utf-8', errors='replace') as f:
            lines = f.readlines()
            
        start_idx = -1
        end_idx = -1
        for i, line in enumerate(lines):
            if line.startswith('## 🔬 Clinical Evidence & Standards'):
                # We found the bad line!
                start_idx = i - 2 # the '---' line above it
                end_idx = i + 7 # the line after '```'
                break
        
        if start_idx != -1:
            new_lines = lines[:start_idx] + lines[end_idx:]
            with open('README.md', 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            print(f'Successfully deleted bad block. File saved as valid UTF-8.')
        else:
            print('Could not find the bad block.')
            # Let's save as UTF-8 anyway to fix any invalid bytes
            with open('README.md', 'w', encoding='utf-8') as f:
                f.writelines(lines)
            print('Saved file as valid UTF-8 anyway.')
            
    except Exception as e:
        print(f'Error: {e}')

if __name__ == '__main__':
    main()

import sys

def check_syntax(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        code = f.read()

    i = 0
    n = len(code)
    line = 1
    col = 1

    in_single_quote = False
    in_double_quote = False
    in_template = False
    in_line_comment = False
    in_block_comment = False

    stack = []
    
    while i < n:
        ch = code[i]
        if ch == '\n':
            line += 1
            col = 1
        else:
            col += 1

        if in_line_comment:
            if ch == '\n':
                in_line_comment = False
        elif in_block_comment:
            if ch == '*' and i + 1 < n and code[i+1] == '/':
                in_block_comment = False
                i += 1
        elif in_single_quote:
            if ch == '\\':
                i += 1
            elif ch == "'":
                in_single_quote = False
        elif in_double_quote:
            if ch == '\\':
                i += 1
            elif ch == '"':
                in_double_quote = False
        elif in_template:
            if ch == '\\':
                i += 1
            elif ch == '`':
                in_template = False
            elif ch == '$' and i + 1 < n and code[i+1] == '{':
                stack.append(('}', line, col))
                i += 1
        else:
            if ch == '/' and i + 1 < n and code[i+1] == '/':
                in_line_comment = True
                i += 1
            elif ch == '/' and i + 1 < n and code[i+1] == '*':
                in_block_comment = True
                i += 1
            elif ch == "'":
                in_single_quote = True
            elif ch == '"':
                in_double_quote = True
            elif ch == '`':
                in_template = True
            elif ch in '{[(':
                closing = {'{': '}', '[': ']', '(': ')'}[ch]
                stack.append((closing, line, col))
            elif ch in '}])':
                if not stack:
                    print(f"Error: Unexpected closing {ch} at line {line}, col {col}")
                    return False
                expected, exp_line, exp_col = stack.pop()
                if ch != expected:
                    print(f"Error: Expected {expected} (opened at line {exp_line}:{exp_col}), but found {ch} at line {line}:{col}")
                    return False
        i += 1

    if stack:
        print(f"Error: Unclosed brackets remaining: {len(stack)}")
        for expected, exp_line, exp_col in stack[-5:]:
            print(f"  Unclosed: expected {expected} from line {exp_line}:{exp_col}")
        return False

    print(f"✓ Syntax brackets perfectly balanced in {filepath}")
    return True

if __name__ == '__main__':
    for path in ['frontend/js/budget_planner.js', 'frontend/js/planner.js', 'frontend/js/app.js']:
        print(f"Checking {path}...")
        check_syntax(path)

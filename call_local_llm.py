import requests
import json
import os

def call_ollama(prompt, context_file):
    with open(context_file, 'r', encoding='utf-8') as f:
        context = f.read()
    
    # Using a smaller coder model for faster response
    model = "deepseek-coder-v2:16b" 
    
    url = "http://localhost:11434/v1/chat/completions"
    headers = {"Content-Type": "application/json"}
    
    messages = [
        {"role": "system", "content": "You are a Real Estate Master Analyst developer. You must implement a web app based on the provided instructions. Focus on high-quality UI and robust architecture."},
        {"role": "user", "content": f"Here is the project specification (cogui.md excerpt):\n\n{context[:10000]}\n\nTask: {prompt}\n\nPlease provide the implementation for the core App component (App.jsx) and the main styling (index.css) to achieve a 'Rich Aesthetics' look. Ensure it follows the 10-step plan."}
    ]
    
    data = {
        "model": model,
        "messages": messages,
        "temperature": 0.2
    }
    
    try:
        response = requests.post(url, headers=headers, data=json.dumps(data), timeout=180)
        response.raise_for_status()
        return response.json()['choices'][0]['message']['content']
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    result = call_ollama("@local cogui.md 내용에 충실하게 앱 구현해 줘.", "cogui.md")
    print(result)

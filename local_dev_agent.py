import requests
import json
import sys

def call_local_llm(prompt, model="deepseek-coder-v2:16b"):
    url = "http://localhost:11434/v1/chat/completions"
    headers = {"Content-Type": "application/json"}
    
    messages = [
        {"role": "system", "content": "You are a professional software developer. Provide high-quality code and implementation details."},
        {"role": "user", "content": prompt}
    ]
    
    data = {
        "model": model,
        "messages": messages,
        "temperature": 0.1
    }
    
    try:
        response = requests.post(url, headers=headers, data=json.dumps(data), timeout=300)
        response.raise_for_status()
        return response.json()['choices'][0]['message']['content']
    except Exception as e:
        return f"Error calling local LLM: {str(e)}"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python local_dev_agent.py 'your prompt'")
    else:
        prompt = sys.argv[1]
        print(call_local_llm(prompt))

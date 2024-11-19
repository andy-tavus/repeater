import json

def say_the_thing():
    try:
        # Prepare the initial response message
        yield f'data: {json.dumps({"choices": [{"delta": {"role":"assistant", "content": "I say this every time."}}]})}\n\n'
        # Signal the end of the stream
        yield 'data: [DONE]\n\n'
    except Exception as e:
        # Return the error in the same format
        yield f'data: {json.dumps({"error": str(e)})}\n\n'
        yield 'data: [DONE]\n\n'

def handler(request):
    # Set the response headers for streaming
    headers = {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "*"
    }

    # Handle CORS preflight request
    if request.method == 'OPTIONS':
        return ("", 204, headers)

    # Stream response
    return (say_the_thing(), 200, headers)

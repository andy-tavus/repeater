export const config = {
  runtime: 'nodejs', // Specify the Node.js runtime
};

export default async function handler(req, res) {
  // Set the response headers for streaming
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // Function to handle streaming response
  async function* sayTheThing() {
    try {
      // Prepare the initial response message
      yield `data: ${JSON.stringify({
        choices: [{ delta: { role: 'assistant', content: 'I say this every time.' } }],
      })}\n\n`;

      // Signal the end of the stream
      yield 'data: [DONE]\n\n';
    } catch (error) {
      // Return the error in the same format
      yield `data: ${JSON.stringify({ error: error.message })}\n\n`;
      yield 'data: [DONE]\n\n';
    }
  }

  // Stream the response
  try {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of sayTheThing()) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      },
    });

    const reader = stream.getReader();
    res.status(200);
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.write('data: [DONE]\n\n');
  } finally {
    res.end();
  }
}

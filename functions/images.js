export async function onRequest({ env }) {
  try {
    const cloudName = "dqntivbw8";
    const apiKey = env.CLOUDINARY_API_KEY;
    const apiSecret = env.CLOUDINARY_API_SECRET;

    if (!apiKey || !apiSecret) {
      return new Response("Missing API keys", { status: 500 });
    }

    const auth = btoa(`${apiKey}:${apiSecret}`);

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?max_results=100`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${auth}`
      }
    });

    const text = await response.text();

    return new Response(text, {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response("Error: " + err.message, { status: 500 });
  }
}

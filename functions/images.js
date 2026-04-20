export async function onRequest({ env }) {
  const cloudName = "dqntivbw8";
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET;

  const auth = btoa(`${apiKey}:${apiSecret}`);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?max_results=100`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`
    }
  });

  const data = await response.json();

  return new Response(JSON.stringify(data.resources), {
    headers: { "Content-Type": "application/json" }
  });
}

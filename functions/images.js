export async function onRequest({ env }) {
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET;

  return new Response(
    JSON.stringify({
      apiKeyExists: !!apiKey,
      apiSecretExists: !!apiSecret,
      apiKeyPreview: apiKey ? apiKey.slice(0, 4) : null
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}

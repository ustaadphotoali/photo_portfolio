export async function onRequest({ env }) {
  const cloudName = "dqntivbw8";
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET;
  const heroImageName = "9412_10_23_2015";

  const auth = btoa(`${apiKey}:${apiSecret}`);
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?max_results=100&direction=desc&image_metadata=true`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`
    }
  });

  const data = await response.json();

  const images = data.resources.map((img) => {
    const pathParts = img.public_id.split("/");
    const name = pathParts[pathParts.length - 1];
    const folderParts = pathParts.slice(0, -1);
    const category = folderParts.length ? folderParts[folderParts.length - 1] : "Uncategorized";
    const folder = folderParts.join("/");

    let lat = null;
    let lng = null;
    let location = null;

    if (img.image_metadata) {
      const meta = img.image_metadata;

      if (meta.GPSLatitude && meta.GPSLongitude) {
        try {
          lat = convertDMSToDD(meta.GPSLatitude, meta.GPSLatitudeRef);
          lng = convertDMSToDD(meta.GPSLongitude, meta.GPSLongitudeRef);
          location = "Captured location";
        } catch (error) {
          console.log("GPS parse error:", error);
        }
      }
    }

    return {
      public_id: img.public_id,
      secure_url: img.secure_url,
      display_name: name,
      category,
      folder,
      width: img.width,
      height: img.height,
      bytes: img.bytes,
      format: img.format,
      isHeroBackground: name === heroImageName,
      lat,
      lng,
      location
    };
  });

  const categories = Array.from(
    images.reduce((map, image) => {
      if (!map.has(image.category)) {
        map.set(image.category, {
          name: image.category,
          folder: image.folder,
          coverImage: image.secure_url,
          count: 0
        });
      }

      map.get(image.category).count += 1;
      return map;
    }, new Map()).values()
  );

  return new Response(JSON.stringify({ images, categories }), {
    headers: { "Content-Type": "application/json" }
  });
}

function convertDMSToDD(dms, ref) {
  const parts = dms.split(",").map((part) => {
    const [num, denom] = part.trim().split("/").map(Number);
    return num / denom;
  });

  let dd = parts[0] + parts[1] / 60 + parts[2] / 3600;

  if (ref === "S" || ref === "W") {
    dd = -dd;
  }

  return dd;
}

import path from 'path';
import { getCompositions } from '@remotion/renderer';
import { z } from 'zod';

async function main() {
  const bundleLocation = "C:\\Users\\campo\\AppData\\Local\\Temp\\remotion-webpack-bundle-mFciN0";
  const browserExecutable = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  
  const inputProps = {
    audioUrl: "http://localhost:3000/temp/temp-audio-1775180037853.mp3",
    imageUrl: "http://localhost:3000/temp/temp-image-1775180037850.jpg",
    title: "Prompt Engineering Basics",
    level: "Intermediate B1-B2",
    format: "solo",
    vocabulary: "[]",
    captions: { words: [] }
  };

  try {
    const compositions = await getCompositions(bundleLocation, {
      inputProps,
      // browserExecutable
    });

    const comp = compositions.find(c => c.id === 'PodcastVideo');
    if (!comp) {
        console.log("No se encontró PodcastVideo");
        return;
    }

    console.log("COMPOSITION PROPS:", JSON.stringify(comp.defaultProps || comp.props, null, 2));

  } catch (err) {
    console.error("Error al obtener compositions:", err);
  }
}

main();

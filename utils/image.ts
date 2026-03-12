import axios from 'axios';

export async function getBase64(url: string): Promise<string | undefined> {
  console.log('Image to base64...');
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });
    console.log('Base64 image generated.');
    return Buffer.from(response.data, 'binary').toString('base64');
  } catch (err) {
    console.log('Can not create base64 from image.', err);
    return undefined;
  }
}

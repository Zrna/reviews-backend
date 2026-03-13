import axios from 'axios';

import { Image } from '../models';
import { ReviewAttributes } from '../types/models';
import { getBase64 } from '../utils/image';

const get_image_by_name_from_database = async (name: ReviewAttributes['name']) => {
  try {
    const result = await Image.findOne({
      where: {
        name: name.toLowerCase(),
      },
    });
    return result;
  } catch (err) {
    console.log('Can not get image from Image table', err);
    return null;
  }
};

const get_image_by_name_from_api = async (name: ReviewAttributes['name']) => {
  try {
    console.log('Making image API request...');
    const response = await axios.get(`https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&t=${name}`);
    const imgUrl = response.data.Poster;

    // `imgUrl` can also be `N/A`
    if (imgUrl && imgUrl.startsWith('http')) {
      const base64Img = await getBase64(imgUrl);

      if (!base64Img) {
        return null;
      }

      const result = await Image.create({
        name: name.toLowerCase(),
        img: base64Img,
      });

      return result;
    }

    return null;
  } catch (err) {
    console.log('Can not get image from API', err);
    return null;
  }
};

export { get_image_by_name_from_api, get_image_by_name_from_database };

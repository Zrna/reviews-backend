const axios = require('axios');

const { Image } = require('../models');
const { getBase64 } = require('../utils/image');

const get_image_by_name_from_database = async name => {
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

const get_image_by_name_from_api = async name => {
  try {
    console.log('Making image API request...');
    const response = await axios.get(`https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&t=${name}`);
    const imgUrl = response.data.Poster;

    // `imgUrl` can also be `N/A`
    if (imgUrl && imgUrl.startsWith('http')) {
      const base64Img = await getBase64(imgUrl);

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

module.exports = {
  get_image_by_name_from_api,
  get_image_by_name_from_database,
};

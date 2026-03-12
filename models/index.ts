import path from 'path';
import { Sequelize } from 'sequelize';

import Image from './Image';
import Review from './Review';
import User from './User';

const env = process.env.NODE_ENV || 'development';
const config = require(path.join(process.cwd(), 'config', 'config.js'))[env];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

User.initModel(sequelize);
Review.initModel(sequelize);
Image.initModel(sequelize);

User.associate({ Review });
Review.associate({ User, Image });
Image.associate({ Review });

export { Image, Review, Sequelize, sequelize, User };

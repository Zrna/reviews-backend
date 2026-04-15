import path from 'path';
import { Sequelize } from 'sequelize';

import Genre from './Genre';
import Media from './Media';
import MediaGenre from './MediaGenre';
import Review from './Review';
import User from './User';

const env = process.env.NODE_ENV || 'development';
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const config = require(path.join(process.cwd(), 'config', 'config.js'))[env];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

User.initModel(sequelize);
Review.initModel(sequelize);
Media.initModel(sequelize);
Genre.initModel(sequelize);
MediaGenre.initModel(sequelize);

User.associate({ Review });
Review.associate({ User, Media });
Media.associate({ Review, Genre, MediaGenre });
Genre.associate({ Media, MediaGenre });

export { Genre, Media, MediaGenre, Review, Sequelize, sequelize, User };

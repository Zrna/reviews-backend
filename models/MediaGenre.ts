import { DataTypes, Model, Sequelize } from 'sequelize';

import { MediaGenreAttributes, MediaGenreCreationAttributes } from '../types/models';

class MediaGenre extends Model<MediaGenreAttributes, MediaGenreCreationAttributes> implements MediaGenreAttributes {
  declare id: number;
  declare mediaId: number;
  declare genreId: number;
  declare createdAt: Date;
  declare updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof MediaGenre {
    MediaGenre.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        mediaId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'media',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        genreId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'genres',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
      },
      {
        sequelize,
        modelName: 'MediaGenre',
        tableName: 'media_genres',
        indexes: [
          {
            unique: true,
            fields: ['mediaId', 'genreId'],
            name: 'media_genres_mediaId_genreId',
          },
        ],
      }
    );

    return MediaGenre;
  }
}

export default MediaGenre;

import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize';

import { GenreAttributes, GenreCreationAttributes, GenreMediaType } from '../types/models';

class Genre extends Model<GenreAttributes, GenreCreationAttributes> implements GenreAttributes {
  declare id: number;
  declare tmdbId: number | null;
  declare mediaType: GenreMediaType;
  declare name: string;
  declare createdAt: Date;
  declare updatedAt: Date;

  static associate(models: Record<string, ModelStatic<Model>>): void {
    Genre.belongsToMany(models.Media, {
      through: models.MediaGenre,
      foreignKey: 'genreId',
      otherKey: 'mediaId',
      as: 'media',
    });
  }

  static initModel(sequelize: Sequelize): typeof Genre {
    Genre.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        tmdbId: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        mediaType: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
      },
      {
        sequelize,
        modelName: 'Genre',
        tableName: 'genres',
        indexes: [
          {
            unique: true,
            fields: ['tmdbId', 'mediaType'],
            name: 'genres_tmdbId_mediaType',
          },
        ],
      }
    );

    return Genre;
  }
}

export default Genre;

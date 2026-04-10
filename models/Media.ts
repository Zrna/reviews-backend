import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize';

import { MediaAttributes, MediaCreationAttributes } from '../types/models';

class Media extends Model<MediaAttributes, MediaCreationAttributes> implements MediaAttributes {
  declare id: number;
  declare name: string;
  declare img: string;
  declare type: string;
  declare createdAt: Date;
  declare updatedAt: Date;

  static associate(models: Record<string, ModelStatic<Model>>): void {
    Media.hasMany(models.Review, {
      foreignKey: 'mediaId',
      sourceKey: 'id',
      as: 'reviews',
    });
  }

  static initModel(sequelize: Sequelize): typeof Media {
    Media.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        img: {
          type: DataTypes.TEXT({ length: 'long' }),
          allowNull: false,
        },
        type: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
      },
      {
        sequelize,
        modelName: 'Media',
        indexes: [{ fields: ['name'] }],
      }
    );

    return Media;
  }
}

export default Media;

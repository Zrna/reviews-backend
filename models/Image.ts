import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize';

import { ImageAttributes, ImageCreationAttributes } from '../types/models';

class Image extends Model<ImageAttributes, ImageCreationAttributes> implements ImageAttributes {
  declare id: number;
  declare name: string;
  declare img: string;
  declare createdAt: Date;
  declare updatedAt: Date;

  static associate(models: Record<string, ModelStatic<Model>>): void {
    Image.hasMany(models.Review, {
      foreignKey: 'imageId',
      sourceKey: 'id',
      as: 'reviews',
    });
  }

  static initModel(sequelize: Sequelize): typeof Image {
    Image.init(
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
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
      },
      {
        sequelize,
        modelName: 'Image',
        indexes: [{ fields: ['name'] }],
      }
    );

    return Image;
  }
}

export default Image;

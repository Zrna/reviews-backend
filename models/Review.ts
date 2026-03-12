import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize';

import { ReviewAttributes, ReviewCreationAttributes } from '../types/models';

class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
  declare id: number;
  declare userId: number;
  declare imageId: number | null;
  declare name: string;
  declare review: string;
  declare rating: number | null;
  declare url: string | null;
  declare watchAgain: boolean | null;
  declare createdAt: Date;
  declare updatedAt: Date;

  static associate(models: Record<string, ModelStatic<Model>>): void {
    Review.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    Review.belongsTo(models.Image, {
      foreignKey: 'imageId',
      targetKey: 'id',
      as: 'image',
    });
  }

  static initModel(sequelize: Sequelize): typeof Review {
    Review.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          // defines the foreign key / relation to the User model
          references: {
            model: 'users', // name of the target table
            key: 'id', // key in the target table that we're referencing
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        imageId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'images', // name of the target table
            key: 'id', // key in the target table that we're referencing
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        review: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        rating: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        url: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        watchAgain: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
      },
      {
        sequelize,
        modelName: 'Review',
        indexes: [
          { fields: ['userId', 'updatedAt'] },
          { fields: ['userId', 'createdAt'] },
          { fields: ['userId', 'rating'] },
          { fields: ['userId', 'name'] },
        ],
      }
    );

    return Review;
  }
}

export default Review;

import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize';

import { AuthProvider, UserAttributes, UserCreationAttributes } from '../types/models';

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: number;
  declare email: string;
  declare password: string | null;
  declare firstName: string | null;
  declare lastName: string | null;
  declare authProvider: AuthProvider;
  declare providerSub: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;

  static associate(models: Record<string, ModelStatic<Model>>): void {
    User.hasMany(models.Review, {
      foreignKey: 'userId',
      as: 'reviews',
    });
  }

  static initModel(sequelize: Sequelize): typeof User {
    User.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        firstName: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        lastName: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        authProvider: {
          type: DataTypes.ENUM('local', 'google', 'apple'),
          allowNull: false,
          defaultValue: 'local',
        },
        providerSub: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
      },
      {
        sequelize,
        modelName: 'User',
      }
    );

    return User;
  }
}

export default User;

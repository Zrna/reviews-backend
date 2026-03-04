module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define(
    'Review',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // defines the foreign key / relation
        references: {
          model: 'users', // Name of the target table
          key: 'id', // Key in the target table that the foreign key references
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      imageId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'images',
          key: 'id',
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
      indexes: [
        { fields: ['userId', 'updatedAt'] },
        { fields: ['userId', 'createdAt'] },
        { fields: ['userId', 'rating'] },
        { fields: ['userId', 'name'] },
      ],
    }
  );

  Review.associate = models => {
    Review.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    Review.belongsTo(models.Image, {
      foreignKey: 'imageId',
      targetKey: 'id',
      as: 'image',
    });
  };

  return Review;
};

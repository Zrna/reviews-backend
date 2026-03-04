module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define(
    'Image',
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
      indexes: [{ fields: ['name'] }],
    }
  );

  Image.associate = models => {
    Image.hasMany(models.Review, {
      foreignKey: 'imageId',
      sourceKey: 'id',
      as: 'reviews',
    });
  };

  return Image;
};

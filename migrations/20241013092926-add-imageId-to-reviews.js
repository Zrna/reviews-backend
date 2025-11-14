'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('reviews', 'imageId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'userId',
    });

    await queryInterface.addConstraint('reviews', {
      fields: ['imageId'],
      type: 'foreign key',
      name: 'fk_reviews_images_id',
      references: {
        table: 'images',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async queryInterface => {
    await queryInterface.removeConstraint('reviews', 'fk_reviews_images_id');
    await queryInterface.removeColumn('reviews', 'imageId');
  },
};

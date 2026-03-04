'use strict';

module.exports = {
  up: async queryInterface => {
    await queryInterface.addIndex('reviews', ['userId', 'updatedAt'], { name: 'reviews_userId_updatedAt' });
    await queryInterface.addIndex('reviews', ['userId', 'createdAt'], { name: 'reviews_userId_createdAt' });
    await queryInterface.addIndex('reviews', ['userId', 'rating'], { name: 'reviews_userId_rating' });
    await queryInterface.addIndex('reviews', ['userId', 'name'], { name: 'reviews_userId_name' });
    await queryInterface.addIndex('images', ['name'], { name: 'images_name' });
  },

  down: async queryInterface => {
    await queryInterface.removeIndex('reviews', 'reviews_userId_updatedAt');
    await queryInterface.removeIndex('reviews', 'reviews_userId_createdAt');
    await queryInterface.removeIndex('reviews', 'reviews_userId_rating');
    await queryInterface.removeIndex('reviews', 'reviews_userId_name');
    await queryInterface.removeIndex('images', 'images_name');
  },
};

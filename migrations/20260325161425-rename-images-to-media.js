'use strict';

module.exports = {
  up: async queryInterface => {
    // Remove old FK constraint
    await queryInterface.removeConstraint('reviews', 'fk_reviews_images_id');

    // Remove old index on images.name
    await queryInterface.removeIndex('images', 'images_name');

    // Rename table
    await queryInterface.renameTable('images', 'media');

    // Rename column in reviews
    await queryInterface.renameColumn('reviews', 'imageId', 'mediaId');

    // Re-add index on media.name
    await queryInterface.addIndex('media', ['name'], { name: 'media_name' });

    // Re-add FK constraint
    await queryInterface.addConstraint('reviews', {
      fields: ['mediaId'],
      type: 'foreign key',
      name: 'fk_reviews_media_id',
      references: {
        table: 'media',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async queryInterface => {
    // Remove new FK constraint
    await queryInterface.removeConstraint('reviews', 'fk_reviews_media_id');

    // Remove new index on media.name
    await queryInterface.removeIndex('media', 'media_name');

    // Rename column back
    await queryInterface.renameColumn('reviews', 'mediaId', 'imageId');

    // Rename table back
    await queryInterface.renameTable('media', 'images');

    // Re-add index on images.name
    await queryInterface.addIndex('images', ['name'], { name: 'images_name' });

    // Re-add FK constraint
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
};

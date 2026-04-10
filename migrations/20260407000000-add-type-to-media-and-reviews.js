'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('media', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'movie',
      after: 'name',
    });

    await queryInterface.changeColumn('media', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
      after: 'name',
    });

    await queryInterface.addColumn('reviews', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'movie',
      after: 'watchAgain',
    });

    await queryInterface.changeColumn('reviews', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
      after: 'watchAgain',
    });
  },

  down: async queryInterface => {
    await queryInterface.removeColumn('media', 'type');
    await queryInterface.removeColumn('reviews', 'type');
  },
};

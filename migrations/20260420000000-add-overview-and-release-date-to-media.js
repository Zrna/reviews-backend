'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('media', 'overview', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'type',
    });

    await queryInterface.addColumn('media', 'releaseDate', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'overview',
    });
  },

  down: async queryInterface => {
    await queryInterface.removeColumn('media', 'releaseDate');
    await queryInterface.removeColumn('media', 'overview');
  },
};

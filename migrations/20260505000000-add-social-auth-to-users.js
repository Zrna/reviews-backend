'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('users', 'password', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('users', 'firstName', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('users', 'lastName', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'authProvider', {
      type: Sequelize.ENUM('local', 'google', 'apple'),
      allowNull: false,
      defaultValue: 'local',
      after: 'lastName',
    });

    await queryInterface.addColumn('users', 'providerSub', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'authProvider',
    });

    await queryInterface.addIndex('users', ['authProvider', 'providerSub'], {
      unique: true,
      name: 'users_provider_sub',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('users', 'users_provider_sub');
    await queryInterface.removeColumn('users', 'providerSub');
    await queryInterface.removeColumn('users', 'authProvider');

    // MySQL keeps the ENUM type alongside the column; dropping the column removes it.
    await queryInterface.changeColumn('users', 'lastName', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('users', 'firstName', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('users', 'password', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};

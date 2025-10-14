"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameTable("Songs", "MusicLists");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameTable("MusicLists", "Songs");
  },
};

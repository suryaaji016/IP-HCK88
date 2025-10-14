"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Playlist extends Model {
    static associate(models) {
      // 1 Playlist milik 1 User
      Playlist.belongsTo(models.User, { foreignKey: "UserId" });
      Playlist.hasMany(models.MusicList, { foreignKey: "PlaylistId" });
    }
  }

  Playlist.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Playlist name is required" },
          notEmpty: { msg: "Playlist name cannot be empty" },
        },
      },
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "UserId is required" },
          isInt: { msg: "UserId must be an integer" },
        },
      },
    },
    {
      sequelize,
      modelName: "Playlist",
    }
  );

  return Playlist;
};

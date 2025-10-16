"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class MusicList extends Model {
    static associate(models) {
      MusicList.belongsTo(models.Playlist, { foreignKey: "PlaylistId" });
    }
  }

  MusicList.init(
    {
      spotifyId: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "spotifyId is required" },
          notEmpty: { msg: "spotifyId cannot be empty" },
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Music name is required" },
          notEmpty: { msg: "Music name cannot be empty" },
        },
      },
      artist: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Artist is required" },
          notEmpty: { msg: "Artist cannot be empty" },
        },
      },
      album: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Album is required" },
          notEmpty: { msg: "Album cannot be empty" },
        },
      },
      image: DataTypes.STRING,
      spotify_url: DataTypes.STRING,
      PlaylistId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "PlaylistId is required" },
          isInt: { msg: "PlaylistId must be an integer" },
        },
      },
    },
    {
      sequelize,
      modelName: "MusicList",
    }
  );

  return MusicList;
};

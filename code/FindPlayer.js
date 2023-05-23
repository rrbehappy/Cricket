
exports.tests = [];
exports.preconditions = []
//let allData = require("./data/player");
var dates = require("dates")
var lib = require("./lib/search_util.js");
var console = require('console')
var http = require('http')

module.exports.function = function(name, imageId, id, battingStyle, bowlingStyle) {
  const options = {
    format: "json",
    headers: {
      // Add any required headers here, e.g., API key
      "API_KEY" : "61df6c5c30msh2d302590d7be1d2p18d095jsn4bc385825130"
    },
  };
  res =  http
    .getUrl("https://cricbuzz-cricket.p.rapidapi.com/teams/v1/2/players", options)
    .then((response) => {
      const players = [];
      // Add categories
      players.push({ $id: 0, name: "BATSMEN", imageId: "174146" });
      players.push({ $id: 11, name: "ALL ROUNDER", imageId: "174146" });
      players.push({ $id: 16, name: "WICKET KEEPER", imageId: "174146" });
      players.push({ $id: 21, name: "BOWLER", imageId: "174146" });

      let idCounter = 1;
      response.forEach((player) => {
        const playerObj = {
          $id: idCounter,
          name: player.name,
          imageId: player.imageId,
          id: player.id,
          battingStyle: player.battingStyle,
          bowlingStyle: player.bowlingStyle,
        };

        players.push(playerObj);
        idCounter++;
      });
    })
    .catch((error) => {
      console.error("Error fetching data from API:", error);
    });

  if (name) {
    players = players.filter(players => players.name && players.name.toLowerCase().indexOf(name.toLowerCase()) >= 0)
  }
  if (imageId) {
    players = players.filter(players => players.imageId && players.imageId == imageId)
  }
  if (id) {
    players = rplayers.filter(players => players.id && players.id == id)
  }
  if (battingStyle) {
    players = players.filter(players => players.battingStyle && players.battingStyle.toLowerCase().indexOf(battingStyle.toLowerCase()) >= 0)
  }
  if (bowlingStyle) {
    players = players.filter(players => players.bowlingStyle && players.bowlingStyle.toLowerCase().indexOf(bowlingStyle.toLowerCase()) >= 0)
  }
  return players
}

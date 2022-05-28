// Test requires nodejs & mocha

var assert = require('assert');
var steam = require('./../humble_pal/steam/steamLibrary.js');
const fs = require('fs');


function getGameLibraryObject() {
  // Create file here with json from API call GatOwnedGames
  // https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=XXXXX&steamid=XXXXX&format=json&include_appinfo=true

  const data = fs.readFileSync('./.no_commit/steam_json/GetOwnedGames.json', 'utf8');
  // parse JSON string to JSON object
  return JSON.parse(data);
}

function findByTitle(title) {
  title = steam.stringReduce(title);
  steamGameLibrary = getGameLibraryObject();
  gameObj = false;
  steamGameLibrary.response.games.forEach(game => {
    if (title == steam.stringReduce(game.name)) {
      gameObj = game;
      return false;
    };
  });
  return gameObj;
};


function gameOwned(gameName) {
  // Returns boolean True
  gameName = steam.stringReduce(gameName);
  game = findByTitle(gameName);
  if (game) {
    return true;
  }
  else {
    return false;
  };
};





describe('Steam Library Functions', () => {

  describe('#stringReduce()', () => {
    it('should return game123 with value Game: 1 2 3!', function () {
      assert.equal(steam.stringReduce("Game: 1 2 3!"),"game123");
    });
  });

  describe("#findByTitle()",() => {
    it('should return game object if a game with the title supplied is found', () => {
      let demoTitle = "SpongeBob SquarePants: Battle for Bikini Bottom - Rehydrated";
      game = findByTitle(demoTitle);
      assert.equal(steam.stringReduce(game.name),steam.stringReduce(demoTitle));
    });
  });

  describe('#getPlayTime()', () => {
    it('should return hours of game time rounded to the second decimal',  () => {
      getPlayTime = function(game) {
        return Math.round((game.playtime_forever/60)*100)/100;
      }
      let demoTitle = "SpongeBob SquarePants: Battle for Bikini Bottom - Rehydrated";
      game = findByTitle(demoTitle);
      assert.equal(getPlayTime(game),0)

      demoTitle = "Payday 2";
      game = findByTitle(demoTitle);
      assert.equal(getPlayTime(game),825.35)
    });
  });

  describe('#gameOwned()', () => {
    it('should return true with value ', function () {
      assert.equal(gameOwned("Payday 2"),true);
      assert.equal(gameOwned("Payday two"),false);
    });
  });
});

describe('WIP Tests', () => {
  describe('Test object notations', () => {
    it('should be able to reference name via dot notation', function () {
      x = {
        name: "Name Goes Here"
      };
      assert.equal(x.name,"Name Goes Here")
    });

    it('should be able to reference name via string notation', function () {
      x = {
        name: "Name Goes Here"
      };
      assert.equal(x["name"],"Name Goes Here")
    });

  }); // End Test object notations
}); // End WIP Tests
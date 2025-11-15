// Global variables
let tileData = [];        // Loaded from scrabble_pieces.json
let currentHand = [];     // Stores the 7 current tiles

$(document).ready(function () {

    console.log("Scrabble HW5 Loaded.");

    // 1. Load Tile JSON
    $.getJSON("scrabble_pieces.json", function (data) {
        tileData = data.pieces;
        console.log("Loaded Tile Data:", tileData);

        // 2. Build board row
        buildBoardRow();

        // 3. Deal initial tiles
        dealTiles();
    });

});
  
//-----------------------------------------------------
//  FUNCTION: Deal 7 random tiles onto rack
//-----------------------------------------------------
function dealTiles() {

    currentHand = [];            // reset internal hand data
    $("#rack-tiles").empty();    // clear tile images on screen

    for (let i = 0; i < 7; i++) {
        let tile = getRandomTile();
        currentHand.push(tile);
        addTileToRack(tile.letter, i);
    }

    console.log("Current Hand:", currentHand);
}
  
//-----------------------------------------------------
//  FUNCTION: Get a random tile using real distribution
//-----------------------------------------------------
function getRandomTile() {

    let available = [];

    // Expand distribution into array of letters
    tileData.forEach(t => {
        for (let i = 0; i < t.amount; i++) {
            available.push(t.letter);
        }
    });

    // Choose a random tile
    let index = Math.floor(Math.random() * available.length);
    let chosenLetter = available[index];

    // Reduce available count
    for (let t of tileData) {
        if (t.letter === chosenLetter) {
            t.amount--;
        }
    }

    return { letter: chosenLetter };
}

//-----------------------------------------------------
//  FUNCTION: Place tile on rack visually + draggable
//-----------------------------------------------------
function addTileToRack(letter, slot) {

    const img = $("<img>")
        .attr("src", `images/Scrabble_Tile_${letter}.jpg`)
        .addClass("scrabble-tile")
        .css({
            left: (slot * 32) + "px", // spacing between tiles
            top: "10px"
        })
        .draggable({
            revert: "invalid",
            containment: "document"
        });

    $("#rack-tiles").append(img);
}
  
//-----------------------------------------------------
//  FUNCTION: Build a single Scrabble row (15 squares)
//-----------------------------------------------------
function buildBoardRow() {

    const bonusPattern = [
        "normal",
        "dl",
        "normal",
        "dw",
        "normal",
        "normal",
        "dl",
        "normal",
        "normal",
        "dw",
        "normal",
        "dl",
        "normal",
        "normal",
        "dw"
    ];

    for (let i = 0; i < 15; i++) {

        let square = $("<div></div>")
            .addClass("board-square")
            .addClass(
                bonusPattern[i] === "dl" ? "bonus-dl" :
                bonusPattern[i] === "dw" ? "bonus-dw" :
                "normal"
            )
            .attr("data-index", i)
            .droppable({
                accept: ".scrabble-tile",
                drop: function (event, ui) {

                    console.log("Tile dropped on square:", i);

                    // Snap tile into the square
                    ui.draggable.position({
                        of: $(this),
                        my: "left top",
                        at: "left top"
                    });
                }
            });

        $("#board-row").append(square);
    }
}

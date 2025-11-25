let tileData = [];              // Loaded from JSON
let currentHand = [];           // Player's tiles
let boardState = Array(15).fill(null);  // Tracks letters placed on board
let totalScore = 0;

$(document).ready(function () {

    console.log("Scrabble HW5 Loaded.");

    $.getJSON("scrabble_pieces.json", function (data) {
        tileData = data.pieces;

        buildBoardRow();
        dealTiles();
        enableRackDrop();
        setupButtons();
    });
});


// build the single row scrabble board
function buildBoardRow() {

    const bonusPattern = [
        "normal", "dl", "normal", "dw", "normal",
        "normal", "dl", "normal", "normal", "dw",
        "normal", "dl", "normal", "normal", "dw"
    ];

    for (let i = 0; i < 15; i++) {

        let square = $("<div></div>")
            .addClass("board-square")
            .attr("data-index", i);

        // Label & color bonus tiles
        if (bonusPattern[i] === "dl") {
            square.addClass("bonus-dl").text("Double\nLetter\nScore");
        } else if (bonusPattern[i] === "dw") {
            square.addClass("bonus-dw").text("Double\nWord\nScore");
        } else {
            square.addClass("normal");
        }

        // Drop handler
        square.droppable({
            accept: ".scrabble-tile",
            drop: function (event, ui) {

                let index = parseInt($(this).attr("data-index"));
                let letter = ui.draggable.attr("data-letter");

                // Validate contiguity rule
                if (!isValidPlacement(index)) {
                    ui.draggable.animate({ top: 10, left: 10 });
                    return;
                }

                // Snap tile onto the square
                ui.draggable.position({
                    of: $(this),
                    my: "left top",
                    at: "left top"
                });

                boardState[index] = letter;
                ui.draggable.attr("data-onboard", "true");
            }
        });

        $("#board-row").append(square);
    }
}


// deal 7 random tiles to player's rack
function dealTiles() {
    currentHand = [];
    $("#rack-tiles").empty();

    for (let i = 0; i < 7; i++) {
        let tile = getRandomTile();
        currentHand.push(tile);
        addTileToRack(tile.letter, i);
    }
}

// random tile selection from available supply
function getRandomTile() {

    let available = [];

    tileData.forEach(t => {
        for (let i = 0; i < t.amount; i++) {
            available.push(t.letter);
        }
    });

    let index = Math.floor(Math.random() * available.length);
    let chosenLetter = available[index];

    // Remove 1 from supply
    for (let t of tileData) {
        if (t.letter === chosenLetter) {
            t.amount--;
        }
    }

    return { letter: chosenLetter };
}


// add tile to rack
function addTileToRack(letter, slot) {

    const img = $("<img>")
        .attr("src", `images/Scrabble_Tile_${letter}.jpg`)
        .addClass("scrabble-tile")
        .attr("data-letter", letter)
        .attr("data-onboard", "false")
        .css({
            left: (slot * 30) + "px",
            top: "10px"
        })
        .draggable({
            revert: "invalid",
            containment: "document"
        });

    $("#rack-tiles").append(img);
}


// rearrange tiles on rack after one is removed
function reflowRackTiles() {
    let tiles = $("#rack-tiles .scrabble-tile");

    tiles.each(function (index) {
        $(this).css({
            left: (index * 30) + "px",
            top: "10px"
        });
    });
}


// enable dropping tiles back to rack
function enableRackDrop() {

    $("#rack-tiles").droppable({
        accept: ".scrabble-tile",
        drop: function (event, ui) {

            ui.draggable.attr("data-onboard", "false");

            // Remove tile from board state
            let letter = ui.draggable.attr("data-letter");
            for (let i = 0; i < boardState.length; i++) {
                if (boardState[i] === letter) {
                    boardState[i] = null;
                    break;
                }
            }

            // Fix layout after return
            setTimeout(() => reflowRackTiles(), 50);
        }
    });
}


// check contiguous placement rule
function isValidPlacement(index) {

    // Board is empty → valid
    if (boardState.every(x => x === null)) return true;

    // Must be next to an existing tile
    if (index > 0 && boardState[index - 1] !== null) return true;
    if (index < 14 && boardState[index + 1] !== null) return true;

    return false;
}


// button handlers
function setupButtons() {

    $("#submit-word").click(function () {

        let letters = [];
        let positions = [];

        // Gather letters on board
        for (let i = 0; i < 15; i++) {
            if (boardState[i] !== null) {
                letters.push(boardState[i]);
                positions.push(i);
            }
        }

        if (letters.length === 0) {
            alert("You must place tiles before submitting a word!");
            return;
        }

        let wordScore = computeScore(positions, letters);
        totalScore += wordScore;

        $("#score").text(totalScore);

        refillRack(letters);
        clearBoard();
    });

    $("#restart").click(function () {
        restartGame();
    });
}


// score calculation (DL / DW)
function computeScore(indices, letters) {

    let wordMult = 1;
    let score = 0;

    for (let i = 0; i < letters.length; i++) {

        let pos = indices[i];
        let letter = letters[i];

        let tileObj = tileData.find(x => x.letter === letter);
        let baseVal = tileObj.value;

        let square = $(".board-square").eq(pos);

        if (square.hasClass("bonus-dl")) {
            score += baseVal * 2;
        } 
        else if (square.hasClass("bonus-dw")) {
            score += baseVal;
            wordMult *= 2;
        } 
        else {
            score += baseVal;
        }
    }

    return score * wordMult;
}


// refill rack after word submission (only for used letters)
function refillRack(usedLetters) {

    let oldTiles = $("#rack-tiles .scrabble-tile").length;
    let need = usedLetters.length;

    for (let i = 0; i < need; i++) {
        let tile = getRandomTile();
        addTileToRack(tile.letter, oldTiles + i);
    }

    // Fix spacing after adding tiles
    reflowRackTiles();
}


// clear the board after word submission
function clearBoard() {
    boardState = Array(15).fill(null);
    $(".scrabble-tile[data-onboard='true']").remove();
}

// restart game completely
function restartGame() {
    location.reload();  // clean + simplest reset
}

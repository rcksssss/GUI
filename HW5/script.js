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
                    // Bounce back to rack like original code
                    ui.draggable.animate({ top: 10, left: 10 }, 300, function() {
                        reflowRackTiles();
                    });
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
        if (tile) {
            currentHand.push(tile);
            addTileToRack(tile.letter, i);
        } else {
            // No more tiles available
            console.log("Tile supply depleted during initial deal");
        }
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

    // Check if tiles are depleted
    if (available.length === 0) {
        return null;
    }

    let index = Math.floor(Math.random() * available.length);
    let chosenLetter = available[index];

    // Remove 1 from supply
    for (let t of tileData) {
        if (t.letter === chosenLetter) {
            t.amount--;
            break;
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


// return a tile to the rack with animation
function returnTileToRack(tile) {
    tile.attr("data-onboard", "false");
    
    // Remove from board state
    let letter = tile.attr("data-letter");
    for (let i = 0; i < boardState.length; i++) {
        if (boardState[i] === letter) {
            boardState[i] = null;
            break;
        }
    }
    
    // Animate back to rack
    tile.animate({
        top: "10px",
        left: "10px"
    }, 300, function() {
        reflowRackTiles();
    });
}


// rearrange tiles on rack after one is removed
function reflowRackTiles() {
    let tiles = $("#rack-tiles .scrabble-tile");

    tiles.each(function (index) {
        $(this).animate({
            left: (index * 30) + "px",
            top: "10px"
        }, 200);
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

            // Position back in rack
            ui.draggable.css({
                top: "10px",
                left: "10px"
            });

            // Fix layout after return
            setTimeout(() => reflowRackTiles(), 50);
        }
    });
}


// check contiguous placement rule with NO GAPS
function isValidPlacement(index) {

    // Board is empty → valid (first tile)
    if (boardState.every(x => x === null)) return true;

    // Must be adjacent to an existing tile
    let hasAdjacent = false;
    if (index > 0 && boardState[index - 1] !== null) hasAdjacent = true;
    if (index < 14 && boardState[index + 1] !== null) hasAdjacent = true;

    if (!hasAdjacent) return false;

    // Check for gaps: all tiles must form a continuous sequence
    // Simulate placing this tile
    let tempBoard = [...boardState];
    tempBoard[index] = "X"; // placeholder

    // Find the range of tiles
    let firstTile = -1, lastTile = -1;
    for (let i = 0; i < 15; i++) {
        if (tempBoard[i] !== null) {
            if (firstTile === -1) firstTile = i;
            lastTile = i;
        }
    }

    // Check if there are any gaps between first and last tile
    for (let i = firstTile; i <= lastTile; i++) {
        if (tempBoard[i] === null) {
            return false; // Gap found!
        }
    }

    return true;
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

        // Validate no gaps in the word
        let firstPos = Math.min(...positions);
        let lastPos = Math.max(...positions);
        for (let i = firstPos; i <= lastPos; i++) {
            if (boardState[i] === null) {
                alert("Your word cannot have gaps! All tiles must be adjacent.");
                return;
            }
        }

        let wordScore = computeScore(positions, letters);
        totalScore += wordScore;

        $("#score").text(totalScore);

        // Clear board first (removes tiles)
        clearBoard();
        
        // Then refill rack
        refillRack(letters.length);
        
        // Check if game should end due to tile depletion
        checkGameEnd();
    });

    $("#restart").click(function () {
        restartGame();
    });
}


// check if game should end
function checkGameEnd() {
    let totalRemaining = 0;
    tileData.forEach(t => {
        totalRemaining += t.amount;
    });
    
    let tilesInRack = $("#rack-tiles .scrabble-tile").length;
    
    // If no tiles remaining and rack isn't full, game is over
    if (totalRemaining === 0 && tilesInRack < 7) {
        setTimeout(() => {
            alert("No more tiles remaining! Final Score: " + totalScore + "\n\nClick 'Restart Game' to play again.");
        }, 500);
    }
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
function refillRack(numToRefill) {

    // Count how many tiles are currently in the rack
    let currentTiles = $("#rack-tiles .scrabble-tile").length;
    let need = Math.min(numToRefill, 7 - currentTiles);

    let added = 0;
    for (let i = 0; i < need; i++) {
        let tile = getRandomTile();
        if (tile) {
            addTileToRack(tile.letter, currentTiles + added);
            added++;
        } else {
            // No more tiles available
            console.log("Cannot refill - tile supply depleted");
            break;
        }
    }

    // Fix spacing after adding tiles
    setTimeout(() => reflowRackTiles(), 100);
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
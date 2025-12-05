# Scrabble HW5 - Write-Up
**Student:** Thomas Boyajian  
**Course:** COMP 4610 GUI Programming I  
**Assignment:** HW5 - Implementing Scrabble with Drag-and-Drop  
**Date:** 12/5/25

## GitHub Links
- **GitHub Pages URL:** https://rcksssss.github.io/GUI/HW5/
- **Repository URL:** (https://github.com/rcksssss/GUI/tree/main/HW5)

---

## Project Description
This project implements a one-line version of Scrabble using jQuery UI drag-and-drop. Players drag letter tiles from a rack onto a board to form words and earn points based on letter values and bonus squares.

---

## Features Implementation

### Fully Working I Believe

**Random Tile Distribution** - I implemented this using the `getRandomTile()` function which reads from the JSON file and builds an array of all available letters based on how many of each are left. Then it picks a random index and decrements that letter's count. This ensures proper Scrabble distribution throughout the game.

**Drag-and-Drop** - Used jQuery UI's `.draggable()` on the tile images and `.droppable()` on the board squares. Set up event handlers in the droppable's `drop` function to handle when a tile lands on a square. The `revert: "invalid"` option makes tiles bounce back if not dropped on a valid target.

**Tile-Square Identification** - Each board square has a `data-index` attribute (0-14) that I set when building the board. In the drop handler, I use `parseInt($(this).attr("data-index"))` to figure out which square was dropped on, then store that info in the `boardState` array.

**Bonus Squares** - I created a `bonusPattern` array that defines which squares are normal, DL, or DW. When building the board in `buildBoardRow()`, I add CSS classes based on this pattern to color the squares and add text labels.

**Score Calculation** - The `computeScore()` function loops through all the letters placed on the board. For each one, it looks up the letter's point value from the JSON data. If the square has the "bonus-dl" class, it doubles just that letter. If it has "bonus-dw", it adds to a word multiplier that gets applied at the end.

**Multiple Words** - The game keeps running after each word submission. I track the remaining tiles in the JSON data structure and have a `checkGameEnd()` function that alerts the player when tiles run out. Otherwise, they can keep playing.

**Board Clearing** - After scoring, `clearBoard()` resets the `boardState` array back to all nulls and uses jQuery to remove all tiles that have `data-onboard='true'` from the DOM.

**Tile Refill** - The `refillRack()` function counts how many tiles are currently in the rack, figures out how many were used, and calls `getRandomTile()` that many times to draw new ones. If there aren't enough tiles left, it just draws whatever's available.

**Score Persistence** - I use a global variable `totalScore` that gets added to every time a word is submitted. The score display updates with `$("#score").text(totalScore)`. It only resets when the restart button is clicked.

**Bounce-Back Validation** - This was tricky to get working. I ended up using the droppable's `accept` function which runs before the drop happens. If it returns false, jQuery UI treats it as invalid and the tile reverts back. I check if the board is empty (first tile must go in square 0) and if tiles are adjacent with no gaps.

**Board-to-Rack Movement** - I made the rack area itself a droppable target using `$("#rack-tiles").droppable()`. When a tile from the board gets dropped there, I update the `boardState` to remove that letter and reposition the tile. Then `reflowRackTiles()` spaces everything out nicely.

**Contiguity Rule** - This is enforced in the `accept` function of the board squares. I check if tiles are adjacent by looking at `boardState[index-1]` and `boardState[index+1]`. To check for gaps, I simulate placing the tile and scan from the first to last tile position to make sure there are no nulls in between.

**Restart** - Simple implementation using `location.reload()` which just refreshes the entire page. This resets everything back to the initial state.

### Known Issues

**Minor Edge Case** - After trying to place two tiles on same spot on the board it messes with the functionallity of the round and will allow any tile from the rack to be placed anywhere on the board during
that round. It fixes itself with the "Restart Game" button but still cannot seem to find a fix.

---

## File Structure
- `index.html` - Main page structure
- `style.css` - Styling and layout
- `script.js` - Game logic and jQuery UI
- `scrabble_pieces.json` - Tile data provided
- `images/` - Tile graphics and rack image

---

## Key Functions

**Game Setup:**
- `buildBoardRow()` - Creates board squares with droppable targets
- `dealTiles()` - Deals 7 random tiles at start
- `enableRackDrop()` - Makes rack accept tiles from board

**Tile Management:**
- `getRandomTile()` - Randomly selects tile from supply
- `addTileToRack()` - Creates draggable tile and adds to rack
- `reflowRackTiles()` - Reorganizes tiles with proper spacing

**Game Logic:**
- `isValidPlacement()` - Checks if tile placement is valid
- `computeScore()` - Calculates score with bonuses
- `refillRack()` - Draws new tiles after word submission
- `clearBoard()` - Clears board state and removes tiles
- `checkGameEnd()` - Alerts when tiles run out

---

## How It Works

1. First tile must be placed in the leftmost square
2. Subsequent tiles must be adjacent (no gaps)
3. Invalid placements bounce back to rack automatically
4. Click "Submit Word" to score and get new tiles
5. Score accumulates until restart

---

## Technologies Used
- jQuery 3.6.0
- jQuery UI 1.13.2 (draggable/droppable)
- JSON for tile data

---

## Sources
- jQuery documentation (https://api.jquery.com/)
- jQuery UI documentation (https://jqueryui.com/)
- Google searches for implementation help
- GeeksforGeeks for JavaScript reference
- Scrabble tile data from course materials (Ramon Meza)

---

## Testing
- Tested random tile selection and distribution
- Verified drag-and-drop functionality on all squares
- Confirmed bonus calculations work correctly
- Validated first tile must go in square 0
- Tested adjacent placement requirement
- Confirmed tiles bounce back on invalid drops
- Tested board-to-rack movement
- Verified score accumulation across words

---

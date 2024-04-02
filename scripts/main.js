
var size = 300;
var padding = 10;
var fontSize = 14;
var numTiles = 4;
var animationTime = 200;

function Tile(boxSize, xpos, ypos, score){

    this.boxSize = boxSize;
    this.xpos = xpos;
    this.ypos = ypos;
    this.score = 2;
    this.cooldown = false;
    this.display = $('<div class="box-2"></div>');

    if(score != null){
        this.score = score;
        this.display.removeClass("box-2");
        this.display.addClass("box-" + this.score);
    }

    this.display.css({
        'width': boxSize + 'px',
        'height': boxSize + 'px',
        'left': (padding + (xpos * boxSize) + (xpos * padding)),
        'top': (padding + (ypos * boxSize) + (ypos * padding))
    });
    $('#game').append(this.display);

    this.increaseScore = function(){
        this.display.removeClass("box-" + this.score);
        this.score = this.score * 2;
        this.cooldown = true;
        this.display.addClass("box-" + this.score);
    }

    this.move = function(x, y){
        if(x != 0){
            if(this.xpos + x >= 0 && this.xpos + x <= numTiles-1){
                this.xpos += x;
                this.display.finish().animate({
                    left: "+=" + ((x * this.boxSize) + (x * padding))
                }, animationTime);
            }
        }else if(y != 0){
            if(this.ypos + y >= 0 && this.ypos + y <= numTiles-1){
                this.ypos += y;
                this.display.finish().animate({
                    top: "+=" + ((y * this.boxSize) + (y * padding))
                }, animationTime);
            }
        }
    }

    this.remove = function(){
        this.display.remove();
    }

}

$(document).ready(function(){

    var screenWidth = $(window).width();
    var screenHeight = $(window).height();

    $('#game').css({
        'width': size + 'px',
        'height': size + 'px',
        'left': ((screenWidth / 2) - (size / 2)) + 'px',
        'top': ((screenHeight / 2) - (size / 2)) + 'px'
    });

    var boxSize = (size - (padding * (numTiles + 1))) / numTiles;
    for(var x = 0; x < numTiles; x++){
        for(var y = 0; y < numTiles; y++){
            var box = $('<div class="box"></div>');
            box.css({
                'width': boxSize + 'px',
                'height': boxSize + 'px',
                'left': (padding + (x * boxSize) + (x * padding)),
                'top': (padding + (y * boxSize) + (y * padding))
            });
            $('#game').append(box);
        }
    }

    var moveCooldown = false;
    var tiles = [];

    function addTile(){
        var freeSpaces = [];
        for(var x = 0; x < tiles.length; x++){
            for(var y = 0; y < tiles[x].length; y++){
                if(tiles[x][y] == 0){
                    freeSpaces.push([x, y]);
                }
            }
        }
        if(freeSpaces.length > 0){
            var i = Math.floor(Math.random() * freeSpaces.length);
            var x = freeSpaces[i][0];
            var y = freeSpaces[i][1];
            tiles[x][y] = new Tile(boxSize, x, y);
        }
    }

    function moveTiles(x, y, moved){
        moveCooldown = true;
        var hasMoved = moved;
        if(x < 0 && y == 0){
            for(var xi = 0; xi < numTiles; xi++){
                for(var yi = 0; yi < numTiles; yi++){
                    hasMoved = moveTile(xi, yi, x, y) || hasMoved;
                }
            }
        }else if(x > 0 && y == 0){
            // right
            for(var xi = numTiles-1; xi >= 0; xi--){
                for(var yi = 0; yi < numTiles; yi++){
                    hasMoved = moveTile(xi, yi, x, y) || hasMoved;
                }
            }
        }else if(y < 0 && x == 0){
            // up
            for(var yi = 0; yi < numTiles; yi++){
                for(var xi = 0; xi < numTiles; xi++){
                    hasMoved = moveTile(xi, yi, x, y) || hasMoved;
                }
            }
        }else if(y > 0 && x == 0){
            // down
            for(var yi = numTiles-1; yi >= 0; yi--){
                for(var xi = 0; xi < numTiles; xi++){
                    hasMoved = moveTile(xi, yi, x, y) || hasMoved;
                }
            }
        }

        if(canMove(x, y)){
            setTimeout(() => { 
                moveTiles(x, y, true); 
            }, animationTime);
        }else{
            if(hasMoved){
                setTimeout(() => { 
                    addTile(); 
                    refreshTiles();
                    moveCooldown = false;
                    //printTiles();

                    // check if win
                    if(checkHighScore(2048)){
                        if(confirm("You Win!")){
                            newGame();
                        } else {
                            newGame();
                        }
                    }
                }, animationTime);
            }else{
                refreshTiles();
                moveCooldown = false;
                if(!canMove(x, y) && allTilesFull()){
                    if(confirm("You Lose, Try Again")){
                        newGame();
                    } else {
                        newGame();
                    }
                }
            }
        }
    }

    function moveTile(xi, yi, x, y){
        if(tiles[xi][yi] != 0 && x+xi >= 0 && x+xi < numTiles && y+yi >= 0 && y+yi < numTiles){
            if(tiles[xi+x][yi+y] == 0){
                var tile = tiles[xi][yi];
                tile.move(x, y);
                tiles[xi+x][yi+y] = tile;
                tiles[xi][yi] = 0;
                return true;
            }else if(tiles[xi+x][yi+y].score == tiles[xi][yi].score && !tiles[xi][yi].cooldown){
                var tile = tiles[xi][yi];
                var removeTile = tiles[xi+x][yi+y];
                tile.move(x, y);
                tile.increaseScore();
                tiles[xi+x][yi+y] = tile;
                tiles[xi][yi] = 0;
                setTimeout(() => { removeTile.remove(); }, animationTime);
                return true;
            }
        }
        return false;
    }

    function canMove(x, y){
        for(var xi = 0; xi < numTiles; xi++){
            for(var yi = 0; yi < numTiles; yi++){
                if(tiles[xi][yi] != 0 && x+xi >= 0 && x+xi < numTiles && y+yi >= 0 && y+yi < numTiles){
                    if(tiles[xi+x][yi+y] == 0 || tiles[xi+x][yi+y].score == tiles[xi][yi].score){
                        if(!tiles[xi][yi].cooldown && !tiles[xi+x][yi+y].cooldown){
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    // if two tiles merge, the result is put on "cooldown" so it cant merge again
    // this function refreshes the cooldown so that the tiles can merge again
    function refreshTiles(){
        for(var xi = 0; xi < numTiles; xi++){
            for(var yi = 0; yi < numTiles; yi++){
                if(tiles[xi][yi] != 0){
                    tiles[xi][yi].cooldown = false;
                }
            }
        }
    }

    function checkHighScore(score){
        for(var xi = 0; xi < numTiles; xi++){
            for(var yi = 0; yi < numTiles; yi++){
                if(tiles[xi][yi] != 0){
                    if(tiles[xi][yi].score >= score){
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function newGame(){
        if(tiles.length > 0){
            for(var xi = 0; xi < numTiles; xi++){
                for(var yi = 0; yi < numTiles; yi++){
                    if(tiles[xi][yi] != 0){
                        tiles[xi][yi].remove();
                    }
                }
            }
        }
        moveCooldown = false;
        tiles = [];
        for(var x = 0; x < numTiles; x++){
            var sub = [];
            for(var y = 0; y < numTiles; y++){
                sub.push(0);
            }
            tiles.push(sub);
        }
        addTile();
    }

    function allTilesFull(){
        var tilesFull = true;
        for(var xi = 0; xi < numTiles; xi++){
            for(var yi = 0; yi < numTiles; yi++){
                if(tiles[xi][yi] == 0) tilesFull = false;
            }
        }
        return tilesFull;
    }

    function printTiles(){
        console.log('\n');
        for(var yi = 0; yi < numTiles; yi++){
            var line = "";
            for(var xi = 0; xi < numTiles; xi++){
                if(tiles[xi][yi] == 0){
                    line += "0  ";
                }else{
                    line += tiles[xi][yi].score + "  ";
                }
            }
            console.log(line);
        }
        console.log('\n');
    }

    newGame();
    //tiles[0][1] = new Tile(boxSize, 0, 1, 8);
    //tiles[1][1] = new Tile(boxSize, 1, 1, 4);
    //tiles[2][1] = new Tile(boxSize, 2, 1, 2);
    //tiles[3][1] = new Tile(boxSize, 3, 1, 2);

    // keyboard press events
    // TODO cooldown period for button presses
    $(document).keydown(function(e){
        switch (e.which){
        case 37:    //left arrow key
            if(!moveCooldown) moveTiles(-1, 0, false);
            break;
        case 38:    //up arrow key
            if(!moveCooldown) moveTiles(0, -1, false);
            break;
        case 39:    //right arrow key
            if(!moveCooldown) moveTiles(1, 0, false);
            break;
        case 40:    //bottom arrow key
            if(!moveCooldown) moveTiles(0, 1, false);
            break;
        }
    });

});
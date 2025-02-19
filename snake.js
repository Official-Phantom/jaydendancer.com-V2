// ------------------------------------------------------------
// Creating A Snake Game Tutorial With HTML5
// Copyright (c) 2015 Rembound.com
// 
// This program is free software: you can redistribute it and/or modify  
// it under the terms of the GNU General Public License as published by  
// the Free Software Foundation, either version 3 of the License, or  
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,  
// but WITHOUT ANY WARRANTY; without even the implied warranty of  
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the  
// GNU General Public License for more details.  
// 
// You should have received a copy of the GNU General Public License  
// along with this program.  If not, see http://www.gnu.org/licenses/.
//
// http://rembound.com/articles/creating-a-snake-game-tutorial-with-html5
// ------------------------------------------------------------

// The function gets called when the window is fully loaded
window.onload = function() {
    // Get the canvas and context
    var canvas = document.getElementById("viewport"); 
    var context = canvas.getContext("2d");

    var score = 0; // Initialize the score

    // Add this near the top of your script, where other variables are defined
var offCanvas = document.createElement("canvas");
offCanvas.width = canvas.width;
offCanvas.height = canvas.height;
var offContext = offCanvas.getContext("2d");
    
    // Timing and frames per second
    var lastframe = 0;
    var fpstime = 0;
    var framecount = 0;
    var fps = 0;
    
    var initialized = false;
    
    // Images
    var images = [];
    var tileimage;
    var boardImage;
    
    // Image loading global variables
    var loadcount = 0;
    var loadtotal = 0;
    var preloaded = false;
    
    // Load images
    function loadImages(imagefiles) {
        // Initialize variables
        loadcount = 0;
        loadtotal = imagefiles.length;
        preloaded = false;
        
        // Load the images
        var loadedimages = [];
        for (var i=0; i<imagefiles.length; i++) {
            // Create the image object
            var image = new Image();
            
            // Add onload event handler
            image.onload = function () {
                loadcount++;
                if (loadcount == loadtotal) {
                    // Done loading
                    preloaded = true;
                }
            };
            
            // Set the source url of the image
            image.src = imagefiles[i];
            
            // Save to the image array
            loadedimages[i] = image;
        }
        
        // Return an array of images
        return loadedimages;
    }
    
    // Level properties
    var Level = function (columns, rows, tilewidth, tileheight) {
        this.columns = columns;
        this.rows = rows;
        this.tilewidth = tilewidth;
        this.tileheight = tileheight;
        
        // Initialize tiles array
        this.tiles = [];
        for (var i=0; i<this.columns; i++) {
            this.tiles[i] = [];
            for (var j=0; j<this.rows; j++) {
                this.tiles[i][j] = 0;
            }
        }
    };
    
    // Generate a default level with walls
    Level.prototype.generate = function() {
        for (var i = 0; i < this.columns; i++) {
            for (var j = 0; j < this.rows; j++) {
                // Set all tiles to empty (no walls)
                this.tiles[i][j] = 0;
            }
        }
    };
    
    
    // Snake
    var Snake = function() {
        this.init(0, 0, 1, 10, 1);
    }
    
    // Direction table: Up, Right, Down, Left
    Snake.prototype.directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    
    // Initialize the snake at a location
    Snake.prototype.init = function(x, y, direction, speed, numsegments) {
        this.x = x;
        this.y = y;
        this.direction = direction; // Up, Right, Down, Left
        this.speed = speed;         // Movement speed in blocks per second
        this.movedelay = 0;
        
        // Reset the segments and add new ones
        this.segments = [];
        this.growsegments = 0;
        for (var i=0; i<numsegments; i++) {
            this.segments.push({x:this.x - i*this.directions[direction][0],
                                y:this.y - i*this.directions[direction][1]});
        }
    }
    
    // Increase the segment count
    Snake.prototype.grow = function() {
        this.growsegments++;
    };
    
    // Check we are allowed to move
    Snake.prototype.tryMove = function(dt) {
        this.movedelay += dt;
        var maxmovedelay = 1 / this.speed;
        if (this.movedelay > maxmovedelay) {
            return true;
        }
        return false;
    };
    
    // Get the position of the next move
    Snake.prototype.nextMove = function() {
        var nextx = this.x + this.directions[this.direction][0];
        var nexty = this.y + this.directions[this.direction][1];
        return {x:nextx, y:nexty};
    }
    
    // Move the snake in the direction
    Snake.prototype.move = function() {
        // Get the next move and modify the position
        var nextmove = this.nextMove();
        this.x = nextmove.x;
        this.y = nextmove.y;
    
        // Get the position of the last segment
        var lastseg = this.segments[this.segments.length-1];
        var growx = lastseg.x;
        var growy = lastseg.y;
    
        // Move segments to the position of the previous segment
        for (var i=this.segments.length-1; i>=1; i--) {
            this.segments[i].x = this.segments[i-1].x;
            this.segments[i].y = this.segments[i-1].y;
        }
        
        // Grow a segment if needed
        if (this.growsegments > 0) {
            this.segments.push({x:growx, y:growy});
            this.growsegments--;
        }
        
        // Move the first segment
        this.segments[0].x = this.x;
        this.segments[0].y = this.y;
        
        // Reset movedelay
        this.movedelay = 0;
    }

    // Create objects
    var snake = new Snake();
    var level = new Level(20, 20, 25, 25); // 20 columns, 20 rows, 25x25 tiles
    
    // Variables
    var score = 0;              // Score
    var gameover = true;        // Game is over
    var gameovertime = 1;       // How long we have been game over
    var gameoverdelay = 0.5;    // Waiting time after game over
    
    // Initialize the game
    function init() {
        // Load images (only snake-graphics.png is needed)
        images = loadImages(["snake-graphics.png"]);
        tileimage = images[0]; // Assign the loaded image to the global variable
    
        // Add mouse events
        canvas.addEventListener("mousedown", onMouseDown);
        
        // Add keyboard events
        document.addEventListener("keydown", onKeyDown);

        function addDpadEventListeners() {
            const leftButton = document.querySelector(".d-pad .left");
            const rightButton = document.querySelector(".d-pad .right");
            const upButton = document.querySelector(".d-pad .up");
            const downButton = document.querySelector(".d-pad .down");
        
            // Function to handle button clicks
            const handleButtonClick = (newDirection) => {
                if (gameover) {
                    // Restart the game if it's over
                    tryNewGame();
                } else {
                    // Change the snake's direction if the game is running
                    if (
                        (newDirection === 0 && snake.direction !== 2) || // Up
                        (newDirection === 1 && snake.direction !== 3) || // Right
                        (newDirection === 2 && snake.direction !== 0) || // Down
                        (newDirection === 3 && snake.direction !== 1)    // Left
                    ) {
                        snake.direction = newDirection;
                    }
                }
            };
        
            // Add event listeners for both touch and click events
            const addButtonEvent = (button, direction) => {
                button.addEventListener("touchstart", (e) => {
                    e.preventDefault(); // Prevent default touch behavior
                    handleButtonClick(direction);
                });
                button.addEventListener("click", () => handleButtonClick(direction));
            };
        
            // Left button
            addButtonEvent(leftButton, 3);
        
            // Right button
            addButtonEvent(rightButton, 1);
        
            // Up button
            addButtonEvent(upButton, 0);
        
            // Down button
            addButtonEvent(downButton, 2);
        }
        
        addDpadEventListeners();
        // New game
        newGame();
        gameover = true;
    
        // Enter main loop
        main(0);
    }
    
    // Check if we can start a new game
    function tryNewGame() {
        if (gameovertime > gameoverdelay) {
            newGame();
            gameover = false;
        }
    }
    
    function newGame() {
        // Initialize the snake at the center of the grid
        snake.init(10, 10, 1, 10, 4); // Start at (10, 10) in a 20x20 grid
            
        // Generate the default level
        level.generate();
            
        // Add an apple
        addApple();
            
        // Initialize the score
        score = 0;
            
        // Initialize variables
        gameover = false;
    }
    
    // Add an apple to the level at an empty position
    function addApple() {
        // Loop until we have a valid apple
        var valid = false;
        while (!valid) {
            // Get a random position within the 20x20 grid
            var ax = randRange(0, level.columns - 1);
            var ay = randRange(0, level.rows - 1);
                
            // Make sure the snake doesn't overlap the new apple
            var overlap = false;
            for (var i = 0; i < snake.segments.length; i++) {
                // Get the position of the current snake segment
                var sx = snake.segments[i].x;
                var sy = snake.segments[i].y;
                    
                // Check overlap
                if (ax == sx && ay == sy) {
                    overlap = true;
                    break;
                }
            }
                
            // Tile must be empty
            if (!overlap && level.tiles[ax][ay] == 0) {
                // Add an apple at the tile position
                level.tiles[ax][ay] = 2;
                valid = true;
            }
        }
    }
    
    // Main loop
    function main(tframe) {
        // Request animation frames
        window.requestAnimationFrame(main);
        
        if (!initialized) {
            // Preloader
            
            // Clear the canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw a progress bar
            var loadpercentage = loadcount/loadtotal;
            context.strokeStyle = "#ff8080";
            context.lineWidth=3;
            context.strokeRect(18.5, 0.5 + canvas.height - 51, canvas.width-37, 32);
            context.fillStyle = "#ff8080";
            context.fillRect(18.5, 0.5 + canvas.height - 51, loadpercentage*(canvas.width-37), 32);
            
            // Draw the progress text
            var loadtext = "Loaded " + loadcount + "/" + loadtotal + " images";
            context.fillStyle = "#000000";
            context.font = "24px 'VT323', monospace";
            context.fillText(loadtext, 18, 0.5 + canvas.height - 63);
            
            if (preloaded) {
                initialized = true;
            }
        } else {
            // Update and render the game
            update(tframe);
            render();
        }
    }
    
    // Update the game state
    function update(tframe) {
        var dt = (tframe - lastframe) / 1000;
        lastframe = tframe;
        
        // Update the fps counter
        updateFps(dt);
        
        if (!gameover) {
            updateGame(dt);
        } else {
            gameovertime += dt;
        }
    }
    
    function updateGame(dt) {
        // Move the snake
        if (snake.tryMove(dt)) {
            // Get the coordinates of the next move
            var nextmove = snake.nextMove();
            var nx = nextmove.x;
            var ny = nextmove.y;
            
            // Check if the next move is outside the canvas boundaries
            if (nx < 0 || nx >= level.columns || ny < 0 || ny >= level.rows) {
                // Collision with the edge of the canvas
                gameover = true;
            } else {
                // Collisions with the snake itself
                for (var i = 0; i < snake.segments.length; i++) {
                    var sx = snake.segments[i].x;
                    var sy = snake.segments[i].y;
                    
                    if (nx == sx && ny == sy) {
                        // Found a snake part
                        gameover = true;
                        break;
                    }
                }
                
                if (!gameover) {
                    // The snake is allowed to move
                    snake.move();
                    
                    // Check collision with an apple
                    if (level.tiles[nx][ny] == 2) {
                        // Remove the apple
                        level.tiles[nx][ny] = 0;
                        
                        // Add a new apple
                        addApple();
                        
                        // Grow the snake
                        snake.grow();
                        
                        // Add a point to the score
                        score++;
                    }
                }
            }
            
            if (gameover) {
                gameovertime = 0;
            }
        }
    }
    
    function updateFps(dt) {
        if (fpstime > 0.25) {
            // Calculate fps
            fps = Math.round(framecount / fpstime);
            
            // Reset time and framecount
            fpstime = 0;
            framecount = 0;
        }
        
        // Increase time and framecount
        fpstime += dt;
        framecount++;
    }
    
    // Render the game
    // Update your render function to look like this
    function render() {
        // Clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
    
        // Draw the level (checkerboard pattern and apples)
        drawLevel();
    
        // Draw the snake to the off-screen canvas
        drawSnakeToOffCanvas();
    
        // Apply the glow effect and render the snake
        applyGlowEffect();
    
        // Update the score display
        document.getElementById("score-display").textContent = "Score: " + score;
    
        // Game over screen
        if (gameover) {
            context.fillStyle = "rgba(0, 0, 0, 0.5)";
            context.fillRect(0, 0, canvas.width, canvas.height);
    
            context.fillStyle = "#eb9898";
            context.font = "24px 'VT323', monospace";
            drawCenterText("Press Any Key To Play", 0, canvas.height / 2, canvas.width);
        }
    }
    
    // Draw the level tiles
    function drawLevel() {
        for (var i = 0; i < level.columns; i++) {
            for (var j = 0; j < level.rows; j++) {
                // Get the current tile and location
                var tile = level.tiles[i][j];
                var tilex = i * level.tilewidth;
                var tiley = j * level.tileheight;
    
                // Draw the tiles with a gradient of red tones
                if ((i + j) % 2 === 0) {
                    context.fillStyle = "#d46a6a"; // Primary tile color
                } else {
                    context.fillStyle = "#c55d5d"; // Secondary tile color
                }
                context.fillRect(tilex, tiley, level.tilewidth, level.tileheight);
    
                // Add a subtle border
                context.strokeStyle = "#a83a3a"; // Border color
                context.lineWidth = 1;
                context.strokeRect(tilex, tiley, level.tilewidth, level.tileheight);
    
                // Draw apples
                if (tile == 2) {
                    // Apply the same shadow effect as the snake's head
                    context.shadowColor = "rgba(0, 0, 0, 0.5)"; // Shadow color
                    context.shadowBlur = 5; // Shadow blur
                    context.shadowOffsetX = 2; // Shadow offset X
                    context.shadowOffsetY = 2; // Shadow offset Y
    
                    // Draw the apple image
                    var tx = 0;
                    var ty = 3;
                    var tilew = 64;
                    var tileh = 64;
                    context.drawImage(tileimage, tx * tilew, ty * tileh, tilew, tileh, tilex, tiley, level.tilewidth, level.tileheight);
    
                    // Reset shadow properties to avoid affecting other drawings
                    context.shadowColor = "transparent";
                    context.shadowBlur = 0;
                    context.shadowOffsetX = 0;
                    context.shadowOffsetY = 0;
                }
            }
        }
    }
    
    // Draw the snake
    // Replace your existing drawSnake function with this
function drawSnakeToOffCanvas() {
    // Clear the off-screen canvas
    offContext.clearRect(0, 0, offCanvas.width, offCanvas.height);

    // Loop over every snake segment
    for (var i = 0; i < snake.segments.length; i++) {
        var segment = snake.segments[i];
        var segx = segment.x;
        var segy = segment.y;
        var tilex = segx * level.tilewidth;
        var tiley = segy * level.tileheight;

        // Determine the correct sprite for the snake segment
        var tx = 0;
        var ty = 0;
        if (i == 0) {
            // Head; Determine the correct image
            var nseg = snake.segments[i + 1]; // Next segment
            if (segy < nseg.y) {
                // Up
                tx = 3; ty = 0;
            } else if (segx > nseg.x) {
                // Right
                tx = 4; ty = 0;
            } else if (segy > nseg.y) {
                // Down
                tx = 4; ty = 1;
            } else if (segx < nseg.x) {
                // Left
                tx = 3; ty = 1;
            }
        } else if (i == snake.segments.length - 1) {
            // Tail; Determine the correct image
            var pseg = snake.segments[i - 1]; // Prev segment
            if (pseg.y < segy) {
                // Up
                tx = 3; ty = 2;
            } else if (pseg.x > segx) {
                // Right
                tx = 4; ty = 2;
            } else if (pseg.y > segy) {
                // Down
                tx = 4; ty = 3;
            } else if (pseg.x < segx) {
                // Left
                tx = 3; ty = 3;
            }
        } else {
            // Body; Determine the correct image
            var pseg = snake.segments[i - 1]; // Previous segment
            var nseg = snake.segments[i + 1]; // Next segment
            if (pseg.x < segx && nseg.x > segx || nseg.x < segx && pseg.x > segx) {
                // Horizontal Left-Right
                tx = 1; ty = 0;
            } else if (pseg.x < segx && nseg.y > segy || nseg.x < segx && pseg.y > segy) {
                // Angle Left-Down
                tx = 2; ty = 0;
            } else if (pseg.y < segy && nseg.y > segy || nseg.y < segy && pseg.y > segy) {
                // Vertical Up-Down
                tx = 2; ty = 1;
            } else if (pseg.y < segy && nseg.x < segx || nseg.y < segy && pseg.x < segx) {
                // Angle Top-Left
                tx = 2; ty = 2;
            } else if (pseg.x > segx && nseg.y < segy || nseg.x > segx && pseg.y < segy) {
                // Angle Right-Up
                tx = 0; ty = 1;
            } else if (pseg.y > segy && nseg.x > segx || nseg.y > segy && pseg.x > segx) {
                // Angle Down-Right
                tx = 0; ty = 0;
            }
        }

        // Draw the image of the snake part
        offContext.drawImage(tileimage, tx * 64, ty * 64, 64, 64, tilex, tiley, level.tilewidth, level.tileheight);
    }
}

// Add this function to your script
function applyGlowEffect() {
    // Apply a blur effect to create the glow
    context.shadowColor = "rgba(0, 0, 0, 0.5)"; // Shadow color
    context.shadowBlur = 10; // Glow intensity
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;

    // Draw the off-screen canvas onto the main canvas
    context.drawImage(offCanvas, 0, 0);

    // Reset shadow properties
    context.shadowColor = "transparent";
    context.shadowBlur = 0;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
}
    
    // Draw text that is centered
    function drawCenterText(text, x, y, width) {
        var textdim = context.measureText(text);
        context.fillText(text, x + (width-textdim.width)/2, y);
    }
    
    // Get a random int between low and high, inclusive
    function randRange(low, high) {
        return Math.floor(low + Math.random()*(high-low+1));
    }
    
    // Mouse event handlers
    function onMouseDown(e) {
        // Get the mouse position
        var pos = getMousePos(canvas, e);
        
        if (gameover) {
            // Start a new game
            tryNewGame();
        } else {
            // Change the direction of the snake
            snake.direction = (snake.direction + 1) % snake.directions.length;
        }
    }
    
    // Keyboard event handler
    function onKeyDown(e) {
        if (gameover) {
            tryNewGame();
        } else {
            var previousDirection = snake.direction; // Store the previous direction
    
            if (e.keyCode == 37 || e.keyCode == 65) {
                // Left or A
                if (snake.direction != 1)  {
                    snake.direction = 3;
                }
            } else if (e.keyCode == 38 || e.keyCode == 87) {
                // Up or W
                if (snake.direction != 2)  {
                    snake.direction = 0;
                }
            } else if (e.keyCode == 39 || e.keyCode == 68) {
                // Right or D
                if (snake.direction != 3)  {
                    snake.direction = 1;
                }
            } else if (e.keyCode == 40 || e.keyCode == 83) {
                // Down or S
                if (snake.direction != 0)  {
                    snake.direction = 2;
                }
            }
    
            // If the direction changed, force a redraw
            if (snake.direction !== previousDirection) {
                render();
            }
        }
    }
    
    // Get the mouse position
    function getMousePos(canvas, e) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: Math.round((e.clientX - rect.left)/(rect.right - rect.left)*canvas.width),
            y: Math.round((e.clientY - rect.top)/(rect.bottom - rect.top)*canvas.height)
        };
    }
    
    // Call init to start the game
    init();
};
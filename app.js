// assign HTML DOM elements
const startBtn = document.querySelector('#start')
const pausedScreen = document.querySelector('.paused-screen');
const winnerScreen = document.querySelector('.winner-screen');
const loserScreen = document.querySelector('.loser-screen');
const numberOfRounds = document.querySelector('input[type=number]');

// create canvas
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// responsive canvas
const resizeCanvas = () => {
    canvas.width = 900;
    canvas.height = 600;
};

// resize event listener
window.addEventListener('resize', () => {
    resizeCanvas();
    location.reload();
});

// call resize canvas
resizeCanvas();

// global variable
let animationId;
let goingUp = false;
let goingDown = false;
let rounds = 3;

// load audio
const hitAudio = new Audio();
const wallAudio = new Audio();
const enemyScoreAudio = new Audio();
const playerScoreAudio = new Audio();
const winnerAudio = new Audio();
const loserAudio = new Audio();

// assign audio source
hitAudio.src = './sounds/hit.mp3';
wallAudio.src = './sounds/wall.mp3';
enemyScoreAudio.src = './sounds/comScore.mp3';
playerScoreAudio.src = './sounds/userScore.mp3';
winnerAudio.src = `./sounds/winner.wav`;
loserAudio.src = `./sounds/loser.wav`;


// ball class
class Ball {
    // constructor function
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.speed = 3;
        this.dx = (Math.random() > 0.5) ? this.speed : -this.speed;
        this.dy = (Math.random() > 0.5) ? this.speed : -this.speed;
        this.radius = 10;
        this.color = 'orange';
    }
    // draw function
    draw() {
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
    // update function
    update() {
        this.draw();

        // keep ball moving
        this.y += this.dy;
        this.x += this.dx;

        // check if ball in between 0 and canvas.height
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
            // play bounce audio
            wallAudio.play();
            // change y direction
            this.dy = -this.dy;
        }
    }
}

// paddle class
class Paddle {
    // constructor function
    constructor(x, y) {
        this.width = 10;
        this.height = 50;
        this.x = x;
        this.y = y;
        this.score = 0;
    }
    // draw function
    draw() {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    // paddle ai
    ai() {
        this.draw();

        this.y += ((ball.y - (this.y + this.height / 2))) * 0.15;

        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
        }

        if (this.y < 0) {
            this.y = 0;
        }
    }
    // player movement
    movement() {
        if (goingUp) this.up();

        if (goingDown) this.down();
    }
    // move paddle up if paddle is greater than 0
    up() {
        if (this.y > 0) this.y -= 5;
    }
    // move paddle down if paddle is less than canvas height
    down() {
        if (this.y + this.height < canvas.height) this.y += 5;
    }
}

// draw score
const drawScore = () => {

    // assign font size and font family
    ctx.font = `30px Arial`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(player.score, canvas.width / 4, canvas.height / 5);
    ctx.fillText(enemy.score, 3 * canvas.width / 4, canvas.height / 5);
};

const drawGame = () => {

    // draw board
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw net
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.setLineDash([5, 15]);
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.closePath();
    ctx.stroke();

    // draw player
    player.draw();

    // draw enemy
    enemy.draw();
};

const collisionControl = (ball, paddle) => {

    // assign paddle positions
    paddle.top = paddle.y;
    paddle.bottom = paddle.y + paddle.height;
    paddle.left = paddle.x;
    paddle.right = paddle.x + paddle.width;

    // assign ball positions
    ball.top = ball.y - ball.radius;
    ball.bottom = ball.y + ball.radius;
    ball.left = ball.x - ball.radius;
    ball.right = ball.x + ball.radius;

    // return true / false
    return paddle.left < ball.right && paddle.top < ball.bottom && paddle.right > ball.left && paddle.bottom > ball.top;
}

const gameLoop = () => {

    // gameloop recursion
    animationId = requestAnimationFrame(gameLoop);

    // draw game
    drawGame();

    // update ball every frame
    ball.update();

    // draw player every frame
    player.movement();
    
    // update enemy every frame
    enemy.ai();
    
    // check if paddle is player or enemy
    let paddle = (ball.x + ball.radius < canvas.width / 2) ? player : enemy;

    // handle collision
    if(collisionControl(ball, paddle)) {

        // play hit audio
        hitAudio.play();
        
        let point = (ball.y - (paddle.y + paddle.height / 2));
        point = point / (paddle.height / 2);
        let angle = (Math.PI / 4) * point;
        let direction = (ball.x + ball.radius < canvas.width / 2) ? 1 : -1;

        ball.dx = direction * Math.cos(angle) * (ball.speed * 2.2) ;
        ball.dy = Math.sin(angle) * (ball.speed * 2.2);
    }

    // check if ball is out of right canvas
    if (ball.x + ball.radius > canvas.width) {
        
        if (player.score < rounds - 1) {
            // show paused screen
            pausedScreen.classList.toggle('ready');

            // increase score
            player.score++;

            // reset ball location
            ball.x = canvas.width / 2;
            ball.y = canvas.height / 2;

        // play audio
            playerScoreAudio.play();
        
        // pause animation frame
            cancelAnimationFrame(animationId);
        } else {
            player.score++;
            // draw score
            drawScore();
            // play winner audio
            winnerAudio.play();
            // show winner screen
            winnerScreen.classList.toggle('retry');
            // cancel gameLoop
            cancelAnimationFrame(animationId);
        }

    }

    // check if ball is out of left canvas
    if(ball.x - ball.radius < 0) {
        
        if (enemy.score < rounds - 1) {
            // show paused screen
            pausedScreen.classList.toggle('ready');

            // increase score
            enemy.score++;

            // reset ball location
            ball.x = canvas.width / 2;
            ball.y = canvas.height / 2;

            // play audio
            enemyScoreAudio.play();
        
            // pause animation frame
            cancelAnimationFrame(animationId);
        } else {
            enemy.score++;
            // draw score
            drawScore();
            // play loser audio
            loserAudio.play();
            // show loser screen
            loserScreen.classList.toggle('retry');
            // cancel gameLoop
            cancelAnimationFrame(animationId);
        }
    }

    // draw score
    drawScore();
};

// create ball
const ball = new Ball();

// create player
const player = new Paddle(20, (canvas.height / 2) - 25);

// create enemy
const enemy = new Paddle(canvas.width - 30, (canvas.height / 2) - 25);

// draw game
drawGame();

// event listeners 
window.addEventListener('click', (e) => {

    if (e.target.id === 'start') {
        
        // hide menu
        document.querySelector('.menu-screen').classList.toggle('hide-menu');

        // change rounds value
        rounds = numberOfRounds.value;
        // start game
        gameLoop();
    }

    if (e.target.id === 'go') {

        // hide menu
        pausedScreen.classList.toggle('ready');

        // start game
        gameLoop();
    }

    if (e.target.id === 'retry-winner' || e.target.id === 'retry-loser') {

        // reload page
        location.reload();
    }
});

// player controls
window.addEventListener('keydown', (e) => {

    switch (e.keyCode) {
        
        // code for arrow up key
        case 38:
            goingUp = true;
            break;

        // code for arrow down key
        case 40:
            goingDown = true;
            break;
    }
});

window.addEventListener('keyup', (e) => {

    switch (e.keyCode) {
        
        // code for arrow up key
        case 38:
            goingUp = false;
            break;

        // code for arrow down key
        case 40:
            goingDown = false;
            break;
    }
});


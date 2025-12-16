let cvs         
let ctx         
let description 
let theme1      
let theme2      
let bg          
let bird        
let bird1       
let bird2       
let pipes       
let ground      
let getReady    
let gameOver    
let map         
let score       
let gameState   
let frame       
let degree      
const SFX_SCORE = new Audio()         
const SFX_FLAP = new Audio()          
const SFX_COLLISION = new Audio()     
const SFX_FALL = new Audio()          
const SFX_SWOOSH = new Audio()        

cvs = document.getElementById('game')
ctx = cvs.getContext('2d')
description = document.getElementById('description')

const ORIGINAL_GAME_WIDTH = 300; 
const ORIGINAL_GAME_HEIGHT = 500; 
const CONTAINER_PADDING = 20;

function resizeGame() {
    const gameScreenElement = document.querySelector(".game-screen");

    const availableWidth = window.innerWidth - CONTAINER_PADDING;
    const availableHeight = window.innerHeight - CONTAINER_PADDING;

    const scaleX = availableWidth / ORIGINAL_GAME_WIDTH;
    const scaleY = availableHeight / ORIGINAL_GAME_HEIGHT;
    
    const scaleFactor = Math.min(scaleX, scaleY);
    
    gameScreenElement.style.transform = `scale(${scaleFactor})`;
    gameScreenElement.style.transformOrigin = 'center';
}

window.addEventListener("load", resizeGame);

window.addEventListener("resize", resizeGame);

theme1 = new Image()
theme1.src = 'img/og-theme.png'
theme2 = new Image()
theme2.src = 'img/og-theme-2.png'
frame = 0;
degree = Math.PI/180
SFX_SCORE.src = 'audio/sfx_point.wav'
SFX_FLAP.src = 'audio/sfx_wing.wav'
SFX_COLLISION.src = 'audio/sfx_hit.wav'
SFX_FALL.src = 'audio/sfx_die.wav'
SFX_SWOOSH.src = 'audio/sfx_swooshing.wav'

gameState = {
    current: 0,
    getReady: 0,
    play: 1,
    gameOver: 2
}
bg = {
    imgX: 0,
    imgY: 0,
    width: 276,
    height: 228,
    x: 0,
    y: cvs.height - 228,
    w: 276,
    h: 228,
    dx: .2,
    render: function() {
        ctx.drawImage(theme1, this.imgX,this.imgY,this.width,this.height, this.x,this.y,this.w,this.h)

        ctx.drawImage(theme1, this.imgX,this.imgY,this.width,this.height, this.x + this.width,this.y,this.w,this.h)

        ctx.drawImage(theme1, this.imgX,this.imgY,this.width,this.height, this.x + this.width*2,this.y,this.w,this.h)
    },

    position: function () {
        if (gameState.current == gameState.getReady) {
            this.x = 0
        }    
        if (gameState.current == gameState.play) {
            this.x = (this.x-this.dx) % (this.w)
        }
    }
}

pipes = {
    top: {
        imgX: 56,
        imgY: 323,
    },
    bot: {
        imgX: 84,
        imgY:323,
    },
    width: 26,
    height: 160,
    w: 55,
    h: 300,
    gap: 85,
    dx: 2,
    minY: -260,
    maxY: -40,
    
    pipeGenerator: [],
    
    reset: function() {
        this.pipeGenerator = []
    },
    render: function() {
        for (let i = 0; i < this.pipeGenerator.length; i++) {
            let pipe = this.pipeGenerator[i]
            let topPipe = pipe.y
            let bottomPipe = pipe.y + this.gap + this.h

            ctx.drawImage(theme2, this.top.imgX,this.top.imgY,this.width,this.height, pipe.x,topPipe,this.w,this.h)
            ctx.drawImage(theme2, this.bot.imgX,this.bot.imgY,this.width,this.height, pipe.x,bottomPipe,this.w,this.h)
        }
    },
    position: function() {
        if (gameState.current !== gameState.play) {
            return
        }
        if (gameState.current == gameState.play) {
            
            if (frame%100 == 0) {
                this.pipeGenerator.push(
                    {
                        x: cvs.width,
                        y: Math.floor((Math.random() * (this.maxY-this.minY+1)) + this.minY)
                    }
                )
            }
            for (let i = 0; i < this.pipeGenerator.length; i++) {

                let pg = this.pipeGenerator[i]
                let b = {
                    left: bird.x - bird.r,
                    right: bird.x + bird.r,
                    top: bird.y - bird.r,
                    bottom: bird.y + bird.r,
                }
                let p = {
                    top: {
                        top: pg.y,
                        bottom: pg.y + this.h
                    },
                    bot: {
                        top: pg.y + this.h + this.gap,
                        bottom: pg.y + this.h*2 + this.gap
                    },
                    left: pg.x,
                    right: pg.x + this.w
                }

                pg.x -= this.dx
                
                if(pg.x < -this.w) {
                    this.pipeGenerator.shift()
                        score.current++
                        SFX_SCORE.play()
                    }

                if (b.left < p.right &&
                    b.right > p.left &&
                    b.top < p.top.bottom &&
                    b.bottom > p.top.top) {
                        gameState.current = gameState.gameOver
                        SFX_COLLISION.play()
                }
                if (b.left < p.right &&
                    b.right > p.left &&
                    b.top < p.bot.bottom &&
                    b.bottom > p.bot.top) {
                        gameState.current = gameState.gameOver
                        SFX_COLLISION.play()
                }
            }
        }
    }
}
ground = {
    imgX: 276,
    imgY: 0,
    width: 224,
    height: 112,
    x: 0,
    y:cvs.height - 112,
    w:224,
    h:112,
    dx: 2,
    render: function() {
        ctx.drawImage(theme1, this.imgX,this.imgY,this.width,this.height, this.x,this.y,this.w,this.h)
        ctx.drawImage(theme1, this.imgX,this.imgY,this.width,this.height, this.x + this.width,this.y,this.w,this.h)
    },

    position: function() {
        if (gameState.current == gameState.getReady) {
            this.x = 0
        }
        if (gameState.current == gameState.play) {
            this.x = (this.x-this.dx) % (this.w/2)
        }
    }
}

map = [
    num0 = {
        imgX: 496,
        imgY: 60,
        width: 12,
        height: 18
    },
    num1 = {
        imgX: 135,
        imgY: 455,
        width: 10,
        height: 18
    },
    num2 = {
        imgX: 292,
        imgY: 160,
        width: 12,
        height: 18
    },
    num3 = {
        imgX: 306,
        imgY: 160,
        width: 12,
        height: 18
    },
    num4 = {
        imgX: 320,
        imgY: 160,
        width: 12,
        height: 18
    },
    num5 = {
        imgX: 334,
        imgY: 160,
        width: 12,
        height: 18
    },
    num6 = {
        imgX: 292,
        imgY: 184,
        width: 12,
        height: 18
    },
    num7 = {
        imgX: 306,
        imgY: 184,
        width: 12,
        height: 18
    },
    num8 = {
        imgX: 320,
        imgY: 184,
        width: 12,
        height: 18
    },
    num9 = {
        imgX: 334,
        imgY: 184,
        width: 12,
        height: 18
    }    
]

score = {
    current: 0,
    best: null,
    x: cvs.width/2,
    y: 40,
    w: 15,
    h: 25,
    reset: function() {
        this.current = 0
    },
    render: function() {
        if (gameState.current == gameState.play ||
            gameState.current == gameState.gameOver) {
            let string = this.current.toString()
            let ones = string.charAt(string.length-1)
            let tens = string.charAt(string.length-2)
            let hundreds = string.charAt(string.length-3)

            if (this.current >= 1000) {
                gameState.current = gameState.gameOver
            
            } else if (this.current >= 100) {
                ctx.drawImage(theme2, map[ones].imgX,map[ones].imgY,map[ones].width,map[ones].height, ( (this.x-this.w/2) + (this.w) + 3 ),this.y,this.w,this.h)

                ctx.drawImage(theme2, map[tens].imgX,map[tens].imgY,map[tens].width,map[tens].height, ( (this.x-this.w/2) ),this.y,this.w,this.h)

                ctx.drawImage(theme2, map[hundreds].imgX,map[hundreds].imgY,map[hundreds].width,map[hundreds].height, (   (this.x-this.w/2) - (this.w) - 3 ),this.y,this.w,this.h)

            } else if (this.current >= 10) {
                ctx.drawImage(theme2, map[ones].imgX,map[ones].imgY,map[ones].width,map[ones].height, ( (this.x-this.w/2) + (this.w/2) + 3 ),this.y,this.w,this.h)

                ctx.drawImage(theme2, map[tens].imgX,map[tens].imgY,map[tens].width,map[tens].height, ( (this.x-this.w/2) - (this.w/2) - 3 ),this.y,this.w,this.h)
            
            } else {
                ctx.drawImage(theme2, map[ones].imgX,map[ones].imgY,map[ones].width,map[ones].height, ( this.x-this.w/2 ),this.y,this.w,this.h)
            }
        }
    }
}    

bird = {
    animation: [
        {imgX: 276, imgY: 114},
        {imgX: 276, imgY: 140},
        {imgX: 276, imgY: 166},
        {imgX: 276, imgY: 140}
    ],
    fr: 0,
    width: 34,
    height: 24,
    x: 50,
    y: 160,
    w: 34,
    h: 24,
    r: 12,
    fly: 5.25,
    gravity: .32,
    velocity: 0,
    render: function() {
        let bird = this.animation[this.fr]
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)
        ctx.drawImage(theme1, bird.imgX,bird.imgY,this.width,this.height, -this.w/2,-this.h/2,this.w,this.h)
        ctx.restore()
    },

    flap: function() {
        this.velocity = - this.fly
    },
    position: function() {
        if (gameState.current == gameState.getReady) {
            this.y = 160
            this.rotation = 0 * degree
            if (frame%20 == 0) {
                this.fr += 1
            }
            if (this.fr > this.animation.length - 1) {
                this.fr = 0
            }

        } else {
            if (frame%4 == 0) {
                this.fr += 1
            }
            if (this.fr > this.animation.length - 1) {
                this.fr = 0
            }

            this.velocity += this.gravity
            this.y += this.velocity

            if (this.velocity <= this.fly) {
                this.rotation = -15 * degree
            } else if (this.velocity >= this.fly+2) {
                this.rotation = 70 * degree
                this.fr = 1
            } else {
                this.rotation = 0
            }

            if (this.y+this.h/2 >= cvs.height-ground.h) {
                this.y = cvs.height-ground.h - this.h/2
                if (frame%1 == 0) {
                    this.fr = 2
                    this.rotation = 70 * degree
                }
                if (gameState.current == gameState.play) {
                    gameState.current = gameState.gameOver
                    SFX_FALL.play()
                }
            }
            
            if (this.y-this.h/2 <= 0) {
                this.y = this.r
            }

        }
    }
}

bird1 = {
    animation: [
        {imgX: 115, imgY: 381},
        {imgX: 115, imgY: 407},
        {imgX: 115, imgY: 433},
        {imgX: 115, imgY: 407}
    ],
    fr: 0,
    width: 18,
    height: 12,
    x: 50,
    y: 160,
    w: 34,
    h: 24,
    r: 12,
    fly: 5.25,
    gravity: .32,
    velocity: 0,
    render: function() {
        let bird = this.animation[this.fr]
        ctx.drawImage(theme2, bird.imgX,bird.imgY,this.width,this.height, this.x-this.w/2,this.y-this.h/2,this.w,this.h)
    },

    flap: function() {
        this.velocity = - this.fly
    },

    position: function() {
        if (gameState.current == gameState.getReady) {
            this.y = 160
            if (frame%20 == 0) {
                this.fr += 1
            }
            if (this.fr > this.animation.length - 1) {
                this.fr = 0
            }

        } else {
            if (frame%4 == 0) {
                this.fr += 1
            }
            if (this.fr > this.animation.length - 1) {
                this.fr = 0
            }

            this.velocity += this.gravity
            this.y += this.velocity

            if (this.y+this.h/2 >= cvs.height-ground.h) {
                this.y = cvs.height-ground.h - this.h/2
                if (frame%1 == 0) {
                    this.fr = 2
                }

                if (gameState.current == gameState.play) {
                    gameState.current = gameState.gameOver
                    SFX_FALL.play()
                }
            }
            
            if (this.y-this.h/2 <= 0) {
                this.y = this.r
            }
        }
    }
}

bird2 = {
    animation: [
        {imgX: 87, imgY: 491},
        {imgX: 115, imgY: 329},
        {imgX: 115, imgY: 355},
        {imgX: 115, imgY: 329}
    ],
    fr: 0,
    imgX: 87,
    imgY: 491,
    width: 18,
    height: 12,
    x: 50,
    y: 160,
    w: 34,
    h: 24,
    r: 12,
    fly: 5.25,
    gravity: .32,
    velocity: 0,
    render: function() {
        let bird = this.animation[this.fr]
        ctx.drawImage(theme2, bird.imgX,bird.imgY,this.width,this.height, this.x-this.w/2,this.y-this.h/2,this.w,this.h)
    },

    flap: function() {
        this.velocity = - this.fly
    },

    position: function() {
        if (gameState.current == gameState.getReady) {
            this.y = 160
            if (frame%20 == 0) {
                this.fr += 1
            }
            if (this.fr > this.animation.length - 1) {
                this.fr = 0
            }

        } else {
            if (frame%4 == 0) {
                this.fr += 1
            }
            if (this.fr > this.animation.length - 1) {
                this.fr = 0
            }

            this.velocity += this.gravity
            this.y += this.velocity

            if (this.y+this.h/2 >= cvs.height-ground.h) {
                this.y = cvs.height-ground.h - this.h/2
                if (frame%1 == 0) {
                    this.fr = 2
                }
                if (gameState.current == gameState.play) {
                    gameState.current = gameState.gameOver
                    SFX_FALL.play()
                }
            }
            
            if (this.y-this.h/2 <= 0) {
                this.y = this.r
            }
        }
    }
}

getReady = {
    imgX: 0,
    imgY: 228,
    width: 174,
    height: 160,
    x: cvs.width/2 - 174/2,
    y: cvs.height/2 - 160,
    w: 174,
    h: 160,
    render: function() {
        if (gameState.current == gameState.getReady) {    
            ctx.drawImage(theme1, this.imgX,this.imgY,this.width,this.height, this.x,this.y,this.w,this.h)
        }
    }
}

gameOver = {
    imgX: 174,
    imgY: 228,
    width: 226,
    height: 158,
    x: cvs.width/2 - 226/2,
    y: cvs.height/2 - 160,
    w: 226,
    h:160,
    render: function() {
        if (gameState.current == gameState.gameOver) {
            ctx.drawImage(theme1, this.imgX,this.imgY,this.width,this.height, this.x,this.y,this.w,this.h)
            
            if (description) {
                description.style.visibility = "visible"
            }
        }
    }
}

let draw = () => {
    ctx.fillStyle = '#00bbc4'
    ctx.fillRect(0,0, cvs.width,cvs.height)
    bg.render()
    pipes.render()
    ground.render()
    score.render()
    bird.render()
    getReady.render()
    gameOver.render()
}

let update = () => {
    bird.position()
    bg.position()
    pipes.position()
    ground.position()
}

let loop = () => {
    draw()
    update()
    frame++
}
loop()
setInterval(loop, 17)

cvs.addEventListener('click', () => {
    if (gameState.current == gameState.getReady) {
        gameState.current = gameState.play
    }
    if (gameState.current == gameState.play) {
        bird.flap()
        SFX_FLAP.play()
        if (description) {
            description.style.visibility = "hidden"
        }
    }
    if (gameState.current == gameState.gameOver) {
        pipes.reset()
        score.reset()
        gameState.current = gameState.getReady
        SFX_SWOOSH.play()
    }
})

document.body.addEventListener('keydown', (e) => {
    if (e.keyCode == 32) {
        if (gameState.current == gameState.getReady) {
            gameState.current = gameState.play
        }
        if (gameState.current == gameState.play) {
            bird.flap()
            SFX_FLAP.play()
            if (description) {
                description.style.visibility = "hidden"
            }
        }
        if (gameState.current == gameState.gameOver) {
            pipes.reset()
            score.reset()
            SFX_SWOOSH.play()
            gameState.current = gameState.getReady
        }
    }
})
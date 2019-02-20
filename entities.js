var characters = ["./characters/Karate.png", "./characters/Archer.png", "./characters/Wizard.png",
    "./characters/Rogue.png", "./characters/Warrior.png", "./characters/Soldier.png", "./characters/Vagrant.png",
    "./characters/FatCat.png"];
var playerNum = 1;
function createCharacter(name, choice) {
    const Character = new Entity(name);
    Character.frameSize = 128;
    Character.size.set(28, 58); //set to actuall pixel size of character, determines collision box. kat is 18,29
    Character.origin = 'self';
    Character.addTrait(new Velocity());
    Character.addTrait(new Jump());
    Character.addTrait(new Go());
    Character.addTrait(new PassDown());
    Character.addTrait(new Punch());
    Character.heading = 1;
    Character.Jumping = false;
    Character.Walking = false;
    Character.Punching = false;
    Character.Kicking = false;
    Character.Throwing = false;
    Character.pain = false;
    Character.damage = 0;
    Character.lives = 3;
    Character.choice = choice || 0;
    Character.player = playerNum;
    playerNum++;

    /*
    * Entity has an empty method called handle that can be overridden by child types.
    * Usage: Tile Collider knows what an entity is but not what a character is. It 
    * can call entity.handle but not Character.updateAnimation. Any entity can override
    * handle for any purpose.
    * @param item is a string indicating intent
    * @author Logan
    */
    Character.handle = function (intent) {
        switch(intent) {
            case 'land':
                if(Character.Jumping) {
                    Character.Jumping = false;
                    Character.updateAnimation();
                }
                break;
            case 'painLeft':
                Character.knockback(intent);
                break;
            case 'painRight':
                Character.knockback(intent);
                break;
        }
    }

    /*
    * hurt runs the pain animation and knocks back the character.
    * @param direction is the direction to be knocked back.
    */
    Character.knockback = function(direction) {
        if(!Character.pain) {
            Character.pain = true;
            Character.jump.start(Character.damage * 0.9);

            var dir = 1.0;
            if(direction == 'painRight') dir = -1;

            Character.go.dir += dir * (Character.damage / 250);
            Character.updateAnimation();
            
            window.setTimeout (function() { 
                Character.pain = false;
                if(!Character.Walking) {
                    Character.go.dir = 0;
                } else {
                    Character.go.dir -= dir * (Character.damage / 250);
                }
                Character.updateAnimation(); 
            }, Character.damage * 2 * 0.85);
        }
    }

    Character.updateAnimation = function () {
        //idle values
        this.startX = 36;
        this.startY = 42;
        this.FrameWidth = Character.frameSize;
        this.FrameHeight = Character.frameSize /2 + 20;
        this.FrameSpeed = 0.1;
        this.FrameLength = 4;
        this.FrameLoop = true;
        this.FrameReverse = false;

        if (Character.Jumping  && !Character.Throwing && !Character.grounded) { //grounded is set on checkY in TileCollider
            this.startX = (3 * Character.frameSize + 36);
            this.startY = (2 * Character.frameSize + 48) - 2;
            this.FrameLength = 1;
            this.FrameSpeed = 1;
        }
        else if (Character.go.dir > 0 && !Character.Throwing) { //go right
            if(!Character.pain) {
                this.startY = 172; //88*2-6
                this.FrameLength = 8;
                this.FrameSpeed = 0.07;
                Character.heading = 1;
            } else {Character.heading = -1;}
        }
        else if (Character.go.dir < 0 && !Character.Throwing) { //go left
            if(!Character.pain) {
                this.startY = 172; //88*2-6
                this.FrameLength = 8;
                this.FrameSpeed = 0.07;
                Character.heading = -1
            } else {Character.heading = 1;}
        }
        else if (Character.Throwing) { //not working
            this.startY = (5 * Character.frameSize + 24 * 2) - 6;
            this.FrameWidth = Character.frameSize;
            this.FrameHeight = Character.frameSize;
            this.FrameLength = 8;
            this.FrameSpeed = 0.04;
            this.FrameLoop = false;   //input holding needs fixed and then this should be set to false
            this.FrameReverse = false;
        }
        if (Character.pain) {
            this.FrameSpeed = 1;
            this.FrameLoop = true;
            this.FrameLength = 1;
        }

        Character.animation = new Animation(ASSET_MANAGER.getAsset(
            characters[Character.choice]),
            this.startX, this.startY, this.FrameWidth, this.FrameHeight,
            this.FrameSpeed, this.FrameLength,
            this.FrameLoop, this.FrameReverse);

            Character.staticAnimation = new Animation(ASSET_MANAGER.getAsset(
                characters[Character.choice]),
                0, 0, this.FrameWidth, this.FrameHeight * 2,
                1, 1,
                true, false);
            
        
    }

    // Character.staticAnimation = new Animation(ASSET_MANAGER.getAsset(
    //     characters[Character.choice]),
    //     0, 0, this.FrameWidth, this.FrameHeight,
    //     1, 1,
    //     true, false);

    Character.punchAnimation = new Animation(ASSET_MANAGER.getAsset(
        characters[Character.choice]), 36, (9 * Character.frameSize + 48) - 4, 
        Character.frameSize, Character.frameSize, 0.05, 9, false, true);

    Character.painAnimation = new Animation(ASSET_MANAGER.getAsset("./effects/Damage.png"), 
        0, 0, 18, 12, 1, 1, true, false);

    Character.draw = function (context) {
        if (Character.heading === -1) {
            context.save();
            context.translate(40, -5);
            context.scale(-1, 1);
            if(!Character.Punching) { 
                Character.animation.drawFrame(deltaTime, context, -this.pos.x, this.pos.y);
            } else { 
                Character.punchAnimation.drawFrame(deltaTime, context, -this.pos.x, this.pos.y);
                if(Character.punchAnimation.isDone()) {
                    Character.animation.drawFrame(deltaTime, context, -this.pos.x, this.pos.y);
                    Character.Punching = false;
                    Character.punchAnimation.elapsedTime = 0;
                }
            }
            if(Character.pain) {
                Character.painAnimation.drawFrame(deltaTime, context, -this.pos.x+18, this.pos.y+22);
            }
            context.restore();
        }

        if (Character.heading === 1) {
            context.save();
            context.translate(-10, -5);
            if(!Character.Punching) {
                Character.animation.drawFrame(deltaTime, context, this.pos.x, this.pos.y);
            } else {
                Character.punchAnimation.drawFrame(deltaTime, context, this.pos.x, this.pos.y+2);
                if(Character.punchAnimation.isDone()) {
                    Character.animation.drawFrame(deltaTime, context, this.pos.x, this.pos.y);
                    Character.Punching = false;
                    Character.punchAnimation.elapsedTime = 0;
                }
            }
            if(Character.pain) {
                Character.painAnimation.drawFrame(deltaTime, context, this.pos.x+18, this.pos.y+22);
            }
            context.restore();
        }
        if (Character.lives >= 0) {
            context
            context.globalAlpha = 0.8;
            context.lineWidth = 5;
            if (Character.player === 1) {
                context.strokeStyle = "#FF0000";
                context.fillStyle = "#FF6a9e";
            } else if (Character.player === 2) {
                context.strokeStyle = "#008000";
                context.fillStyle = "#65ff96";
            } else if (Character.player === 3) {
                context.strokeStyle = "#0000FF";
                context.fillStyle = "#009FFF";
            } else if (Character.player === 4) {
                context.strokeStyle = "#FFb400";
                context.fillStyle = "#FFFF00";
            }
            context.fillRect(95 + 320 * (Character.player - 1), 678, 105, 40);
            context.strokeRect(95 + 320 * (Character.player - 1), 678, 105, 40);
            
            for(var i = 0; i < Character.lives; i++ ) {
                context.save();
                context
                Character.staticAnimation.drawFrame(0, context, 
                    120 + (i * 18) + 320 * (Character.player - 1), 
                    660, 0.5);
                context.restore();
            }
            context.globalAlpha = 1.0;
            context.lineWidth = 1;
            context.strokeStyle = 'black';
            context.font = "10px Arial";
            context.strokeText("player " + Character.player, 99 + 320 * (Character.player - 1), 689);
            context.lineWidth = 2;
            context.font = "20px Arial";
            context.strokeText(Character.damage, 100 + 320 * (Character.player - 1), 710);
        }
    }

    Character.updateAnimation();
    return Character;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;

    ctx.drawImage(this.spriteSheet,
        index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
        this.frameWidth, this.frameHeight,
        locX, locY,
        this.frameWidth * scaleBy,
        this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////GUIDE/////////
/*
//////create sprite and its coordination///////////
this.chicken = this.game.add.sprite(this.game.world.centerX, 
    this.game.world.centerY, 'chicken');
this.horse = this.game.add.sprite(120, 10, 'horse');
this.sheep = this.game.add.sprite(100, 250, 'sheep')

/////create anchor point for the sprite to the center , default is top-left///////
//0 is for left, 1 is for right, middle is 0.5
this.chicken.anchor.setTo(0.5);
this.sheep.anchor.setTo(0.5);


////////scale the sprite size///////////////////
//change the parameter value to -ve value to flip sprite
this.chicken.scale.setTo(1);
this.horse.scale.setTo(0.5);
this.sheep.scale.setTo(0.5);


///////rotate the sprite/////
this.sheep.angle = -45;

//get final destination of current animal
this.currentAnimal.x = endX;

//move current animal to final destination
newAnimal.x = this.game.world.centerX;

*/


var GameState = {
    //load game assets
    preload: function(){
        this.load.image('background', 'assets/images/background.png');
        this.load.image('arrow', 'assets/images/arrow.png');

        this.load.spritesheet('chicken', 'assets/images/chicken_spritesheet.png', 131, 200, 3);
        this.load.spritesheet('horse', 'assets/images/horse_spritesheet.png', 212, 200, 3);
        this.load.spritesheet('pig', 'assets/images/pig_spritesheet.png', 297, 200, 3);
        this.load.spritesheet('sheep', 'assets/images/sheep_spritesheet.png', 244, 200, 3);

        this.load.audio('chickenSound', ['assets/audio/chicken.ogg', 'assets/audio/chicken.mp3']);
        this.load.audio('horseSound', ['assets/audio/horse.ogg', 'assets/audio/horse.mp3']);
        this.load.audio('pigSound', ['assets/audio/pig.ogg', 'assets/audio/pig.mp3']);
        this.load.audio('sheepSound', ['assets/audio/sheep.ogg', 'assets/audio/sheep.mp3']);
        
    },
    //executed after everything is loaded
    create: function(){
        //create sprite for bg
        this.background = this.game.add.sprite(0, 0, 'background');

        //scalling options
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

        //have the game centered horizontally and vertically
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;

        //group animals
        var animalData = [
            {key: 'chicken', text: 'CHICKEN', audio: 'chickenSound'},
            {key: 'horse', text: 'HORSE', audio: 'horseSound'},
            {key: 'pig', text: 'PIG', audio: 'pigSound'},
            {key: 'sheep', text: 'SHEEP', audio: 'sheepSound'}
        ];

        this.animals = this.game.add.group();

        var self = this;
        var animal;

        animalData.forEach(function(element){
            //create each animal and save it's properties
            animal = self.animals.create(-1000, this.game.world.centerY, element.key, 0);

            //parameter for text and sound
            animal.customParams = {text: element.text, sound: self.game.add.audio(element.audio)};
            
            //anchor point to set the sprite to center
            animal.anchor.setTo(0.5);

            //create animal animation
            animal.animations.add('animate', [0, 1, 2, 1, 0 ,1], 3, false);

            //enable input so its interactive
            animal.inputEnabled = true;
            animal.input.pixelPerfectClick = true;
            animal.events.onInputDown.add(self.animateAnimal, this);

        });

        //place first animal in the middle
        this.currentAnimal = this.animals.next();
        this.currentAnimal.position.set(this.game.world.centerX, this.game.world.centerY);

        //show animal text
        this.showText(this.currentAnimal);

        //left arrow
        this.leftArrow = this.game.add.sprite(60, this.game.world.centerY, 'arrow');
        this.leftArrow.anchor.setTo(0.5);
        this.leftArrow.scale.x = -1;
        this.leftArrow.customParams = {direction: -1};

        //left arrow input
        this.leftArrow.inputEnabled = true;
        this.leftArrow.input.pixelPerfectClick = true;
        this.leftArrow.events.onInputDown.add(this.switchAnimal, this);

        //right arrow
        this.rightArrow = this.game.add.sprite(580, this.game.world.centerY, 'arrow');
        this.rightArrow.anchor.setTo(0.5);
        this.rightArrow.customParams = {direction: 1};

        //right arrow input
        this.rightArrow.inputEnabled = true;
        this.rightArrow.input.pixelPerfectClick = true;
        this.rightArrow.events.onInputDown.add(this.switchAnimal, this);


        
    },
    //keep executing the game(run loop)
    update: function(){
    },

    animateAnimal: function(sprite, event){
        console.log('animate animal')
        sprite.play('animate');
        sprite.customParams.sound.play();
    },

    switchAnimal: function(sprite, event){
        console.log('move animal')

        if(this.isMoving){
            return false;
        }

        this.isMoving = true;

        //hide text
        this.animalText.visible = false;

        var newAnimal, endX;

        //get direction of animal and get next animal
        if(sprite.customParams.direction>0){
            newAnimal = this.animals.next();
            newAnimal.x = -newAnimal.width/2;
            endX = 640 + this.currentAnimal.width/2;
        }
        else{
            newAnimal = this.animals.previous();
            newAnimal.x = 640 + newAnimal.width/2;
            endX = -this.currentAnimal.width/2;
        }

        //make a tween animations, moving on x
        var newAnimalMovement = this.game.add.tween(newAnimal);
        newAnimalMovement.to({x: this.game.world.centerX}, 1000);
        newAnimalMovement.onComplete.add(function()
        {
            this.isMoving = false;
            this.showText(newAnimal);
        }, this);
        newAnimalMovement.start();

        var currentAnimalMovement = this.game.add.tween(this.currentAnimal);
        currentAnimalMovement.to({x: endX}, 1000);
        currentAnimalMovement.start();

        //set the next animal as the new current animal
        this.currentAnimal = newAnimal;   
    },

    showText: function(animal){
        if(!this.animalText){
            var style = {
                font: 'bold 30pt Arial',
                fill: '#D0171B',
                align: 'center'
            }
            this.animalText = this.game.add.text(this.game.width/2, this.game.height * 0.85, '', style);
            this.animalText.anchor.setTo(0.5);
        }

        this.animalText.setText(animal.customParams.text);
        this.animalText.visible = true;
    }

};

//initialize phaser framework
var game = new Phaser.Game(640, 360, Phaser.AUTO);

//load the gamestate
game.state.add('GameState', GameState);
game.state.start('GameState');
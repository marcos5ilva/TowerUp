

var GameState = {
    
    init: function () {
        //define screen game area
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        
        //initiate physics system
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.physics.arcade.gravity.y = 1000;
        
        //set player control
        this.cursors = this.game.input.keyboard.createCursorKeys();//listening pressed arrow keys
        
        //game bounds
        this.game.world.setBounds (0, 0, 360, 700);
        
        //constants
        this.RUNNING_SPEED = 180;
        this.JUMPING_SPEED = 550;
        
       
    },
    
    preload: function () {
        
        //load game image assets
        this.load.image('actionButton', 'assets/images/actionButton.png');
        this.load.image('arrowButton', 'assets/images/arrowButton.png');
        this.load.image('barrel', 'assets/images/barrel.png');
        this.load.image('goal', 'assets/images/gorilla3.png');
        this.load.image('ground', 'assets/images/ground.png');
        this.load.image('platform', 'assets/images/platform.png');
        
        //load game spritesheets
        this.load.spritesheet('fire', 'assets/images/fire_spritesheet.png', 20, 21, 2, 1, 1 );
        this.load.spritesheet('player', 'assets/images/knight_spritesheet.png', 63, 63, 7, 1, 1);
        
        //load json file
        this.load.text('level', 'assets/data/level.json');
        
    },
    
    create: function () {
        
        //insert ground
        this.ground = this.add.sprite(0, 638, 'ground');
        //enable physical body on ground sprite
        this.game.physics.arcade.enable(this.ground);
        this.ground.body.allowGravity = false;
        this.ground.body.immovable = true;
        
        //parse json file
        this.levelData = JSON.parse(this.game.cache.getText('level'));
        
        //insert platform
        
        this.platforms = this.add.group();
        this.platforms.enableBody = true;
       
        //insert platforms using json file's coordenates
        this.levelData.platformData.forEach(function(element){
            this.platforms.create(element.x, element.y, 'platform');
        }, this);
        
        this.platforms.setAll('body.immovable', true);
        this.platforms.setAll('body.allowGravity', false);
        
        //fires
        this.fires = this.add.group();
        this.fires.enableBody = true;
        
        var fire;
        
        //insert fire animation using json file's coordenates
        
        this.levelData.fireData.forEach(function(element){
            fire = this.fires.create(element.x, element.y, 'fire');
            fire.body.setSize(14, 14, 1,1);
            fire.animations.add('fire', [0, 1], 4, true);
            fire.play('fire');
        }, this);
        
        this.fires.setAll('body.allowGravity', false);
        
        //gorilla NPC
        this.goal = this.add.sprite(this.levelData.goal.x, this.levelData.goal.y, 'goal');
        this.game.physics.arcade.enable(this.goal);
        this.goal.body.allowGravity = true;
        
        //create player
        this.player = this.add.sprite(this.levelData.playerStart.x, this.levelData.playerStart.y, 'player', 0);
        this.player.anchor.setTo(0.5);
        //this.player.scale.setTo(0.5);
        this.player.animations.add('walking', [1, 2, 3, 4], 6, true);
        //this.player.animations.add('jumping', [5,6],2, false);
       
        //this.player.play('walking');
         //enable physical body on platform sprite
        this.game.physics.arcade.enable(this.player);
        this.player.body.collideWorldBounds=true;
        this.player.body.setSize(46, 60, 1,1);
        this.player.customParams={};
        
        //create barrels
        this.barrels = this.add.group();
        this.barrels.enableBody = true;
      
        
        this.createBarrel();
        this.barrelCreator = this.game.time.events.loop(Phaser.Timer.SECOND * this.levelData.barrelFrequency, this.createBarrel, this)
        
        //create screen controls 
        this.createOnscreenControls();
        
        //create camera
        this.game.camera.follow(this.player);
    },
    
    update: function () {
        
        //set collision detection 
        this.game.physics.arcade.collide(this.player, this.ground);
        this.game.physics.arcade.collide(this.player, this.platforms);
        this.game.physics.arcade.collide(this.goal, this.platforms);
        
        this.game.physics.arcade.overlap(this.player, this.fires, this.killPlayer);
        
        this.game.physics.arcade.overlap(this.player, this.goal, this.winGame);
        
        this.game.physics.arcade.overlap(this.player, this.barrels, this.killPlayer);
        
        this.game.physics.arcade.collide(this.barrels, this.ground);
        this.game.physics.arcade.collide(this.barrels, this.platforms);
        
        //set player x velocity to 0 so the player just will move when you press arrow keys
        this.player.body.velocity.x=0;
        
        //kiling barrels
        this.barrels.forEach(function(element){
            if (element.x < 10 && element.y >600){
                element.kill();
            }
        }, this);
        
      
        
        if(this.cursors.left.isDown || this.player.customParams.isMovingLeft){
            this.player.body.velocity.x = -this.RUNNING_SPEED;
            this.player.scale.setTo(-1,1); //flipping player sprite
            this.player.play('walking');
            
        }
        else if(this.cursors.right.isDown || this.player.customParams.isMovingRight){
            this.player.body.velocity.x = this.RUNNING_SPEED;
            this.player.scale.setTo(1,1); //flipping player sprite
            this.player.play('walking'); 
        }
        
        else if((this.cursors.up.isDown || this.player.customParams.mustJump) && this.player.body.touching.down){
            this.player.body.velocity.y= -this.JUMPING_SPEED;
            this.player.customParams.mustJump = false;
            this.player.frame =5;
        }
        else{
                this.player.animations.stop();
                if( this.player.body.touching.down)
                    this.player.frame =3;
        }
        ;
    },
    
    createOnscreenControls: function(){
        this.leftArrow = this.add.button(20, 535, 'arrowButton');
        this.rightArrow = this.add.button(110, 535, 'arrowButton');
        this.actionButton = this.add.button(280, 535, 'actionButton');
        
        this.leftArrow.alpha = 0.5;
        this.rightArrow.alpha = 0.5;
        this.actionButton.alpha = 0.5;
        
        //fixed screen button possition although the camera is moving
       this.leftArrow.fixedToCamera = true;
        this.rightArrow.fixedToCamera = true;
        this.actionButton.fixedToCamera = true;
        
        //add button events
        
        //jump
        this.actionButton.events.onInputDown.add( function() {
            this.player.customParams.mustJump = true;
        }, this);
        
        this.actionButton.events.onInputUp.add( function() {
            this.player.customParams.mustJump = false;
        }, this);
        
        //moving left
        this.leftArrow.events.onInputDown.add( function() {
            this.player.customParams.isMovingLeft = true;
        }, this);
        
        this.leftArrow.events.onInputUp.add( function() {
            this.player.customParams.isMovingLeft = false;
        }, this);
        this.leftArrow.events.onInputOver.add( function() {
            this.player.customParams.isMovingLeft = true;
        }, this);
        
        this.leftArrow.events.onInputOut.add( function() {
            this.player.customParams.isMovingLeft = false;
        }, this);
        
        //moving right
        this.rightArrow.events.onInputDown.add( function() {
            this.player.customParams.isMovingRight = true;
        }, this);
        
        this.rightArrow.events.onInputUp.add( function() {
            this.player.customParams.isMovingRight = false;
        }, this);
        
        this.rightArrow.events.onInputOver.add( function() {
            this.player.customParams.isMovingRight = true;
        }, this);
        
        this.rightArrow.events.onInputOut.add( function() {
            this.player.customParams.isMovingRight = false;
        }, this);
},
    
    killPlayer: function(player, fire){
        game.state.start('GameState');
    },
    
    winGame: function(player, goal){
        console.log('you win!')
        game.state.start('GameState'); 
    },
    
    createBarrel: function (){
        //check if we have any dead barrel sprite
        var barrel = this.barrels.getFirstExists(false);
        
        //creates a new barrel if we have no dead one barrel sprite 
        if(!barrel){
            //create a new barrel out of the screen
            barrel = this.barrels.create(0, 0, 'barrel'); 
            console.log("barrel created");
        }
        
        barrel.body.collideWorldBounds = true;
        barrel.body.setSize(15, 15, 1,1);
        barrel.body.bounce.set(1,.3);
        //move the created barrel to the gorilla coordenates
        barrel.reset(this.levelData.goal.x, this.levelData.goal.y); 
        barrel.body.velocity.x = this.levelData.barrelSpeed;
    }
    
};


var screenWidth = 360;
var screenHeight = 592;

var game = new Phaser.Game(screenWidth, screenHeight, Phaser.AUTO );

game.state.add('GameState', GameState);
game.state.start('GameState');

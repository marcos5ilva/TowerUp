

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
        //this.game.world.setBounds (0, 0, 360, 700);
        
        //constants
        this.RUNNING_SPEED = 180;
        this.JUMPING_SPEED = 460;
        
       
    },
    
    preload: function () {
        
        //load game image assets
        this.load.image('actionButton', 'assets/images/actionButton.png');
        this.load.image('arrowButton', 'assets/images/arrowButton.png');
        //this.load.image('barrel', 'assets/images/barrel.png');
        //this.load.image('goal', 'assets/images/gorilla3.png');
        //this.load.image('ground', 'assets/images/ground.png');
        //this.load.image('platform', 'assets/images/platform.png');
        this.load.image('activateBlock', 'assets/graphics/activateBlock.png');
        this.load.image('secretPassage', 'assets/graphics/secretPassage.png');
        
        //load game spritesheets
        //this.load.spritesheet('fire', 'assets/images/fire_spritesheet.png', 20, 21, 2, 1, 1 );
        this.load.spritesheet('player', 'assets/images/knight_spritesheetPB.png', 64, 64, 8, 1, 1);
        
        this.load.spritesheet('chest', 'assets/graphics/chest.png', 32, 32, 3, 1, 1);
        //load sounds
        this.load.audio('jump', ['assets/sounds/jump.ogg', 'assets/sounds/jump.mp3']);
        this.load.audio('dragStone', ['assets/sounds/draggingStone.ogg', 'assets/sounds/draggingStone.mp3']);
        this.load.audio('levelTheme', ['assets/sounds/Komiku_-_06_-_Filthy.mp3']);
        this.load.audio('chestOpening', ['assets/sounds/chestOpening.ogg', 'assets/sounds/chestOpening.mp3']);
        
        //load tiled level
        this.load.tilemap('towerUp1', 'assets/graphics/towerUp1.json', null, Phaser.Tilemap.TILED_JSON);
        
        this.load.image('tiles', 'assets/graphics/blackAndWhiteTiles.png');
      
        
    },
    
    create: function () {
        
        //Create level platforms and background
        this.createLevel();
     
        //creat sound effects
        this.jumpSound = this.add.audio('jump');
        this.dragStone = this.add.audio('dragStone', 0.7, false);
        this.levelTheme = this.add.audio('levelTheme', 0.3, true);
        this.chestOpening = this.add.audio('chestOpening', 0.5, false);
        
        //create tile objects activateBlock and secretPassage
        this.activateBlock = game.add.sprite(-32 , 600, 'activateBlock');
        this.secretPassage = game.add.sprite(-32 , 600, 'secretPassage');
        
        //create tresure tiles
        this.tresure = game.add.group();
        this.level.createFromObjects('tresure', 'chest1', 'chest', 0, true, false, this.tresure);
        this.level.createFromObjects('tresure', 'chest2', 'chest', 0, true, false, this.tresure);
        game.physics.arcade.enable(this.tresure);
       
        this.tresure.setAll('anchor.y', -1);
        this.tresure.setAll('body.immovable', true);
        this.tresure.setAll('body.allowGravity', false);
        
         this.game.physics.arcade.enable(this.activateBlock);
         this.game.physics.arcade.enable(this.secretPassage);
        
        
        //objects level position for activateBlock and secretPassage
        this.level.objects['activateBlock'].forEach(function(element){
             this.activateBlock.x = element.x;
            this.activateBlock.y = element.y;                                       
        }, this);
        
        this.level.objects['secretPassage'].forEach(function(element){
            this.secretPassage.x = element.x;
            this.secretPassage.y = element.y;                                       
        }, this);
        
        
        
        this.secretPassage.enableBody = true;
        this.secretPassage.body.immovable = true;
        this.secretPassage.body.allowGravity =false;
        
        
        this.activateBlock.enableBody = true;
        this.activateBlock.body.immovable = true;
        this.activateBlock.body.allowGravity =false;
        
        //chef if is the first time the player colide with the activateBlock
         this.activateSecret = false;
        
        //create player
        this.player = this.add.sprite(10, 450, 'player', 0);
        this.player.anchor.setTo(0.5);
        this.player.animations.add('walking', [1, 2, 3, 4], 6, true);
     
     
        //enable physical body on platform sprite
        this.game.physics.arcade.enable(this.player);
        this.player.body.collideWorldBounds=true;
        this.player.body.setSize(40, 54, 1,1);
        this.player.customParams={};
        
        //create screen controls 
        this.createOnscreenControls();
        
        //create camera
        this.game.camera.follow(this.player);
        
        //play level theme sound
        
        this.levelTheme.play();
    },
    
    update: function () {
        
        //set collision detection 
        this.game.physics.arcade.collide(this.player, this.layerGround);
        this.game.physics.arcade.collide(this.player, this.layerPlatform);
        this.game.physics.arcade.collide(this.player, this.layerWall);
        
        this.game.physics.arcade.collide(this.player, this.layerEnemy, this.killPlayer);
        this.game.physics.arcade.overlap(this.player, this.layerBorder, this.grabPlayer, null, this);
        this.game.physics.arcade.overlap(this.player, this.tresure, this.chestOpen, null, this);
        
        //this.game.physics.arcade.collide(this.activateBlock, this.layerPlatform);
        //this.game.physics.arcade.collide(this.activateBlock, this.layerGround);
        //this.game.physics.arcade.collide(this.activateBlock, this.layerWall);
        this.game.physics.arcade.collide(this.player, this.activateBlock, this.openPassage, null, this);
        
        //this.game.physics.arcade.collide(this.secretPassage, this.layerPlatform);
        //this.game.physics.arcade.collide(this.secretPassage, this.layerGround);
        //this.game.physics.arcade.collide(this.secretPassage, this.layerWall);
        this.game.physics.arcade.collide(this.secretPassage, this.player);
        
        /*
       
        this.game.physics.arcade.collide(this.goal, this.platforms);
        this.game.physics.arcade.overlap(this.player, this.goal, this.winGame);
       */
        
        //set player x velocity to 0 so the player just will move when you press arrow keys
        this.player.body.velocity.x=0;
        
        //kiling barrels
      /*  this.barrels.forEach(function(element){
            if (element.x < 10 && element.y >600){
                element.kill();
            }
        }, this);*/
        
      
        
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
        else if((this.cursors.up.isDown || this.player.customParams.mustJump) && (this.player.body.onFloor() || this.player.body.touching.down) ){
            this.player.body.velocity.y= -this.JUMPING_SPEED;
            this.player.frame =5;
            this.player.customParams.mustJump = false;
            this.jumpSound.play();
            
            
        }
        else{
                this.player.animations.stop();
                if( this.player.body.onFloor()){
                    this.player.frame =0;
                };
            
            if(!this.player.customParams.mustJump && this.player.body.touching.down){
                this.jumpSound.play();
            }
        }
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
    
    createLevel: function(){
        
        //set background color
        this.game.stage.backgroundColor='#000000';
        
        //load tiled map
        this.level=this.add.tilemap('towerUp1');
        
        this.level.addTilesetImage('blackAndWhiteTiles', 'tiles');
        
        //create level layers
        
        this.layerBackground = this.level.createLayer('Background');
        this.layerGround = this.level.createLayer('Ground');
        this.layerWall = this.level.createLayer('Wall');
        this.layerPlatform = this.level.createLayer('Platform');
        this.layerBorder = this.level.createLayer('Border');
        this.layerDoor = this.level.createLayer('Door');
        this.layerEnemy = this.level.createLayer('Enemy');
        
        game.world.setBounds(0, 0, this.level.width*32, this.level.height*32);
        
        //collision detection
        
        this.level.setCollisionBetween(0, 576, true, 'Ground');
        this.level.setCollisionBetween(0, 576, true, 'Platform');
        this.level.setCollisionBetween(0, 576, true, 'Border');
        this.level.setCollisionBetween(0, 576, true, 'Wall');
        this.level.setCollisionBetween(0, 576, true, 'Enemy');
     
        
    },
    
    killPlayer: function(player, fire){
        game.state.start('GameState');
    },
    
    openPassage: function(player, activateBlock){
        
        if(!this.activateSecret && this.player.body.touching.down && this.activateBlock.body.touching.up ){
        var tween = game.add.tween(this.secretPassage);
        tween.to({ y: 60}, 1000, 'Linear', true, 0);
        tween.start();
        this.dragStone.play();
        
        this.activateSecret =true;
        }
    },
    

    
    winGame: function(player, goal){
        console.log('you win!')
        game.state.start('GameState'); 
    },
    
    grabPlayer: function(player, layerBorder){
       // player.frame =7;
        //player.customParams.mustJump = true;
    },
    
    chestOpen: function(player, tresure){
        
             this.chestOpening.play();
            this.tresure.forEach(function(chest){
               
                chest.frame = 1;
                console.log("chest opened");
                console.log (chest);
            });
       
            
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


var screenWidth = 384;
var screenHeight = 576;

var game = new Phaser.Game(screenWidth, screenHeight, Phaser.AUTO );

game.state.add('GameState', GameState);
game.state.start('GameState');

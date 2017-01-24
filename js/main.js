

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
        
        //WASD Controls
        game.input.keyboard.addKey(Phaser.Keyboard.W);
        game.input.keyboard.addKey(Phaser.Keyboard.A);
        game.input.keyboard.addKey(Phaser.Keyboard.S);
        game.input.keyboard.addKey(Phaser.Keyboard.D);

        //game bounds
        //this.game.world.setBounds (0, 0, 360, 700);
        
        //constants
        this.RUNNING_SPEED = 180;
        this.JUMPING_SPEED = 445;
        this.RATS_SPEED = 50;
        
       
    },
    
    preload: function () {
        
        //load game image assets
        this.load.image('actionButton', 'assets/graphics/actionButton.png');
        this.load.image('arrowButton', 'assets/graphics/arrowButton.png');
        this.load.image('activateBlock', 'assets/graphics/activateBlock.png');
        this.load.image('secretPassage', 'assets/graphics/secretPassage.png');
    
        this.load.spritesheet('player', 'assets/graphics/thief48.png', 47, 48, 3, 1, 1);
        
        this.load.spritesheet('chest', 'assets/graphics/chest24.png', 24, 24, 3, 1, 1);
        this.load.spritesheet('keyRegular', 'assets/graphics/keyRegular.png', 23, 24, 7, 1,1);
        
        this.load.spritesheet('rats', 'assets/graphics/rats.png', 23, 24, 4, 1,1);
        
        //load sounds
        this.load.audio('jump', ['assets/sounds/jump.ogg', 'assets/sounds/jump.mp3']);
        this.load.audio('dragStone', ['assets/sounds/draggingStone.ogg', 'assets/sounds/draggingStone.mp3']);
        this.load.audio('levelTheme', ['assets/sounds/Komiku_-_06_-_Filthy.mp3']);
        this.load.audio('chestOpening', ['assets/sounds/chestOpening.ogg', 'assets/sounds/chestOpening.mp3']);
        
        //load tiled level
        this.load.tilemap('towerUp1', 'assets/graphics/towerUp01.json', null, Phaser.Tilemap.TILED_JSON);
        
        this.load.image('tiles', 'assets/graphics/blackAndWhiteTiles01.png');
      
        
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
        this.keyRegular = game.add.sprite(-32 , 600, 'keyRegular');
        this.rats = game.add.sprite(-32, 600, 'rats');
        
        //create tresure tiles
        this.tresure = game.add.group();
        this.level.createFromObjects('tresure', 'chest1', 'chest', 0, true, false, this.tresure);
        this.level.createFromObjects('tresure', 'chest2', 'chest', 0, true, false, this.tresure);
        
        game.physics.arcade.enable(this.tresure);
       
        this.tresure.setAll('anchor.y', -1);
        this.tresure.setAll('body.immovable', true);
        this.tresure.setAll('body.allowGravity', false);
        console.log(this.tresure);
        
        this.game.physics.arcade.enable(this.activateBlock);
        this.game.physics.arcade.enable(this.secretPassage);
        this.game.physics.arcade.enable(this.keyRegular);
        this.game.physics.arcade.enable(this.rats);
        
        //objects level position for activateBlock and secretPassage
        this.level.objects['activateBlock'].forEach(function(element){
             this.activateBlock.x = element.x;
            this.activateBlock.y = element.y;                                       
        }, this);
        
        this.level.objects['secretPassage'].forEach(function(element){
            this.secretPassage.x = element.x;
            this.secretPassage.y = element.y;                                       
        }, this);
        
        this.level.objects['keyRegular'].forEach(function(element){
            this.keyRegular.x = element.x;
            this.keyRegular.y = element.y;                                       
        }, this);
        
        this.level.objects['rats'].forEach(function(element){
            this.rats.x = element.x;
            this.rats.y = element.y;                                       
        }, this);
        
        
        
        
        
        
        this.secretPassage.enableBody = true;
        this.secretPassage.body.immovable = true;
        this.secretPassage.body.allowGravity =false;
        
        
        this.activateBlock.enableBody = true;
        this.activateBlock.body.immovable = true;
        this.activateBlock.body.allowGravity =false;
        
        this.keyRegular.enableBody = true;
        this.keyRegular.body.immovable = true;
        this.keyRegular.body.allowGravity = false;
        this.keyRegular.visible =false;
        
        this.rats.enableBody = true;
        //this.rats.body.immovable = true;
        this.rats.body.allowGravity = true;
        this.rats.body.setSize(24, 16, 1,1);
        
        //chef if is the first time the player colide with the activateBlock
         this.activateSecret = false;
        
        //create player
        this.player = this.add.sprite(10, 450, 'player', 1);
        this.player.anchor.setTo(0.5);
        this.player.animations.add('walking', [0, 1], 7, true);
        this.player.animations.add('idle', [0, 1], 1, true);
     
        
        this.keyRegular.animations.add('girar', [0, 1,2,3,4,5], 6, true);
        
        this.rats.animations.add('walk', [0, 1], 6, true);
        this.rats.animations.add('attack', [2, 3], 2, false);
     
        //enable physical body on platform sprite
        this.game.physics.arcade.enable(this.player);
        this.player.body.collideWorldBounds=true;
        this.player.body.setSize(32, 45, 1,1);
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
        
        this.game.physics.arcade.collide(this.rats, this.layerGround); 
        this.game.physics.arcade.collide(this.rats, this.layerPlatform);
        this.game.physics.arcade.collide(this.rats, this.layerWall, this.ratsColideWall, null, this);
        this.game.physics.arcade.collide(this.rats, this.layerEnemyLimit, this.ratsColideWall, null, this); 
        this.game.physics.arcade.collide(this.rats, this.player, this.killPlayer, null, this);
        /*
       
        this.game.physics.arcade.collide(this.goal, this.platforms);
        this.game.physics.arcade.overlap(this.player, this.goal, this.winGame);
       */
        
        //set player x velocity to 0 so the player just will move when you press arrow keys
        this.player.body.velocity.x=0;
        
        //enemy rats
        //this.rats.body.velocity.x = 100;
        this.enemyRats();
        //kiling barrels
      /*  this.barrels.forEach(function(element){
            if (element.x < 10 && element.y >600){
                element.kill();
            }
        }, this);*/
        
      
        
        if(this.cursors.left.isDown || game.input.keyboard.isDown(Phaser.Keyboard.A) || this.player.customParams.isMovingLeft){
            this.player.body.velocity.x = -this.RUNNING_SPEED;
            this.player.scale.setTo(-1,1); //flipping player sprite
            this.player.play('walking');
            
        }
        else if(this.cursors.right.isDown || game.input.keyboard.isDown(Phaser.Keyboard.D) || this.player.customParams.isMovingRight){
            this.player.body.velocity.x = this.RUNNING_SPEED;
            this.player.scale.setTo(1,1); //flipping player sprite
            this.player.play('walking'); 
        }
        
        else{
                this.player.animations.stop();
                if( this.player.body.onFloor()){
                    this.player.frame =0;
                    //this.player.play('idle');
                };
            
            if(!this.player.customParams.mustJump && this.player.body.touching.down){
                this.jumpSound.play();
            }
        }


        //  Allow the player to jump if they are touching the ground.
        if((this.cursors.up.isDown || game.input.keyboard.isDown(Phaser.Keyboard.W) || this.player.customParams.mustJump) && (this.player.body.onFloor() || this.player.body.touching.down) ){
            this.player.body.velocity.y= -this.JUMPING_SPEED;
            this.player.frame =2;
            this.player.customParams.mustJump = false;
            this.jumpSound.play();
     
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
        
        this.level.addTilesetImage('blackAndWhiteTiles01', 'tiles');
        
        //create level layers
        
        this.layerBackground = this.level.createLayer('Background');
        this.layerGround = this.level.createLayer('Ground');
        this.layerWall = this.level.createLayer('Wall');
        this.layerPlatform = this.level.createLayer('Platform');
        this.layerBorder = this.level.createLayer('Border');
        this.layerDoor = this.level.createLayer('Door');
        this.layerEnemy = this.level.createLayer('Enemy');
        this.layerEnemyLimit = this.level.createLayer('EnemyLimit')
        
        game.world.setBounds(0, 0, this.level.width*32, this.level.height*32);
        
        //collision detection
        
        this.level.setCollisionBetween(0, 576, true, 'Ground');
        this.level.setCollisionBetween(0, 576, true, 'Platform');
        this.level.setCollisionBetween(0, 576, true, 'Border');
        this.level.setCollisionBetween(0, 576, true, 'Wall');
         this.level.setCollisionBetween(0, 576, true, 'EnemyLimit');
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
    
    chestOpen: function(player, chest){
        
             this.chestOpening.play();
             chest.frame = 1;
        this.keyRegular.visible = true;
          this.keyRegular.play('girar');  
            game.time.events.add(Phaser.Timer.SECOND * 1, function(){
              
                chest.destroy();
            }, this).autoDestory = true;
                
            
     
    },
    
    enemyRats: function(){
        
        this.rats.body.velocity.x = this.RATS_SPEED;
        this.rats.play('walk', true);
        this.rats.body.bounce.set(1,.1);
        
    },
    
    ratsColideWall: function(){
        
        
        //this.rats.animations.stop(null, true);
        //this.rats.play('attack');
        

        this.RATS_SPEED*= (-1);
         this.rats.scale.x *=(-1)
        
        
       
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

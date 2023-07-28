import Phaser from 'phaser';
import TextureKeys from '../consts/TextureKeys';
import SceneKeys from '../consts/SceneKeys';
import Mouse from '../game/Mouse';
import LaserObstacle from '../game/LaserObstacle';
import EventDispatcher from '../utils/EventDispatcher';
import EmitKeys from '../consts/EmitKeys';
export default class Game extends Phaser.Scene {

    private background!: Phaser.GameObjects.TileSprite;
    private mouseHole!: Phaser.GameObjects.Image;
    private windows:Phaser.GameObjects.Image[] = [];
    private bookcases:Phaser.GameObjects.Image[] = [];
    private window1!: Phaser.GameObjects.Image;
    private window2!: Phaser.GameObjects.Image;
    private bookcase1!: Phaser.GameObjects.Image;
    private bookcase2!: Phaser.GameObjects.Image;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    private mouse!: Mouse;
    private laserObstacle!: LaserObstacle;
    private emitter!: EventDispatcher;
    private coins!: Phaser.Physics.Arcade.StaticGroup;
    private dot!: Phaser.GameObjects.Image;
    private scoreLabel!: Phaser.GameObjects.Text;
    private score = 0;

    constructor() {
        super(SceneKeys.Game);
    }

    prepareReactOnEmits() {
        this.emitter = EventDispatcher.getInstance();
        this.emitter.on(EmitKeys.MouseDead,()=>{
            this.scene.run(SceneKeys.GameOver);
        })
    }

    init() {
        this.score = 0;
    }


    private prepareScoreLabel() {
        this.scoreLabel = this.add.text(10, 10, `Score: ${this.score}`, {
            fontSize: '24px',
            color: '#080808',
            backgroundColor: '#F8E71C',
            shadow: { fill: true, blur: 0, offsetY: 0 },
            padding: { left: 15, right: 15, top: 10, bottom: 10 }
        })
        .setScrollFactor(0);
        this.emitter.on(EmitKeys.FindCoin, () => {
            this.changeScore(1);
        })
    }
    private changeScore(addValue: integer){
        this.score += addValue;
        this.scoreLabel.text = `Score: ${this.score}`;
    }
    create() {
        const w = this.scale.width;
        const h =this.scale.height;
        this.background = this.add.tileSprite(0,0, w, h, TextureKeys.Background)
            .setOrigin(0,0)
            .setScrollFactor(0,0);
        this.mouseHole = this.add.image(Phaser.Math.Between(900,1500), 501, TextureKeys.MouseHole);
        this.window1 = this.add.image(Phaser.Math.Between(900,1300), 200, TextureKeys.Window1);
        this.window2 = this.add.image(Phaser.Math.Between(1600,2000), 200, TextureKeys.Window2);
        this.windows = [this.window1, this.window2];
        this.bookcase1 = this.add.image(Phaser.Math.Between(2200,2700), 580, TextureKeys.Bookcase1)
            .setOrigin(0.5,1);
        this.bookcase2 = this.add.image(Phaser.Math.Between(2900,3400), 580, TextureKeys.Bookcase2)
            .setOrigin(0.5,1);
        this.bookcases = [this.bookcase1, this.bookcase2];
        // const mouse = this.physics.add.sprite(w * 0.5,h - 30, TextureKeys.Mouse,'rocketmouse_fly01.png.png')
        //     .setOrigin(0.5,1)
        //     .play(AnimationKeys.MouseRun);
        this.mouse = new Mouse(this, w * 0.5, h - 30);
        //const mouse = new Mouse(this, w * 0.5, h * 0.5);

        this.add.existing(this.mouse);
        const body = this.mouse.body as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true);
        //*************************************************
        //*************************************************
        //*************************************************
        //*************************************************
        //*************************************************
        body.setVelocityX(200);
        this.cameras.main.startFollow(this.mouse);
        this.cameras.main.setBounds(0,0,Number.MAX_SAFE_INTEGER, h);

        this.physics.world.setBounds(0,0,Number.MAX_SAFE_INTEGER, h - 30);

        this.laserObstacle = new LaserObstacle(this, 500, 100);
        // const laserObstacle2 = new LaserObstacle2(this, 500, 100);
        this.add.existing(this.laserObstacle);


        // @ts-ignore
        this.physics.add.overlap(this.mouse,this.laserObstacle,this.handleOverlapLaser,undefined,this);

        this.cursors = this.input.keyboard?.createCursorKeys();
        // const im = this.add.image(500,100,TextureKeys.Dot);

        //Монеты
        this.coins = this.physics.add.staticGroup();
        this.dot = this.add.image(0 ,100, TextureKeys.Dot);
        this.spawnCoins()
        // @ts-ignore
        this.physics.add.overlap(this.mouse,this.coins,this.handleOverlapCoins,undefined,this);

        this.prepareReactOnEmits();
        this.prepareScoreLabel();
        setInterval(()=>{
            console.log(this.cameras.main.scrollX);
        },1000);
    }

    private spawnCoins() {

        this.coins.children.each(entry => {
            const coin = entry as Phaser.Physics.Arcade.Sprite;
            this.coins.killAndHide(coin);
            if(coin.body) coin.body.enable = false;
        });
        const scrollX = this.cameras.main.scrollX;
        const rightEdge = scrollX + this.scale.width;
        // this.add.image(scrollX , 100, TextureKeys.Dot);
        // this.add.image(rightEdge , 100, TextureKeys.Dot);

        let x = rightEdge + 100;
        let y = 100;
        //let x = 100;
        const numCoins = Phaser.Math.Between(1, 20);
        for (let i = 0; i < numCoins; i++) {
            y = Phaser.Math.Between(100, this.scale.height - 100)
            const coin = this.coins.get(x,
                y,
                TextureKeys.Coin
                )
            coin.setVisible(true);
            coin.setActive(true);

            const body = coin.body as Phaser.Physics.Arcade.StaticBody;
            body.setCircle(body.width * 0.5);
            body.enable = true;
            x += coin.width * 1.5;
            body.updateFromGameObject();
        }
        this.dot.x = x;

    }

    private handleOverlapLaser(mouse: Mouse, laser: Phaser.GameObjects.GameObject) {
        mouse.kill();
    }

    update(time: number, delta: number) {
        this.background.setTilePosition(this.cameras.main.scrollX);
        this.wrapMouseHole();
        this.wrapWindows();
        this.wrapBookcase();
        this.wrapLaserObstacle();
        this.wrapCoins();

        if (this.cursors?.up.isDown) {
            console.log(this.coins.getLength());
            this.spawnCoins();
        }

        this.teleportBack();
        /*if (this.cursors?.up.isDown) this.mouse.up();
        if (this.cursors?.down.isDown) this.mouse.down();
        if (this.cursors?.left.isDown) this.mouse.left();
        if (this.cursors?.right.isDown) this.mouse.right();*/
    }

    wrapCoins() {
        const scrollX = this.cameras.main.scrollX;
        const rightSide = scrollX + this.scale.width;
            if (this.dot.x <scrollX) {
                this.spawnCoins();
            }
    }

    wrapLaserObstacle() {
        const scrollX = this.cameras.main.scrollX;
        const rightSide = scrollX + this.scale.width;

        if (this.laserObstacle.x + this.laserObstacle.width < scrollX) {
            const newX = Phaser.Math.Between(rightSide + this.laserObstacle.width, rightSide + 1000);;
            const newY = Phaser.Math.Between(0,300);
            this.laserObstacle.moveLaserTo(newX, newY);
        }

    }

    wrapMouseHole() {
        const scrollX = this.cameras.main.scrollX;
        const rightSide = scrollX + this.scale.width;

        if (this.mouseHole.x + this.mouseHole.width < scrollX) {
            this.mouseHole.x = Phaser.Math.Between(rightSide + 100, rightSide + 1000);
        }
    }
    wrapWindows() {
        const scrollX = this.cameras.main.scrollX;
        const rightSide = scrollX + this.scale.width;

        let width = this.window1.width * 2;
        if (this.window1.x + width < scrollX) {
            this.window1.x = rightSide + Phaser.Math.Between (width, width + 800);
        }

        width = this.window2.width;
        if (this.window2.x + width < scrollX) {
            this.window2.x = this.window1.x + Phaser.Math.Between(width, width + 800);
        }

        this.window1.setVisible(!this.isOverlaps(this.window1, this.bookcases));
        this.window2.setVisible(!this.isOverlaps(this.window2, this.bookcases));
    }
    wrapBookcase() {
        const scrollX = this.cameras.main.scrollX;
        const rightSide = scrollX + this.scale.width;

        let width = this.bookcase1.width * 2;
        if (this.bookcase1.x + width < scrollX) {
            this.bookcase1.x = rightSide + Phaser.Math.Between (width, width + 800);
        }

        width = this.bookcase2.width;
        if (this.bookcase2.x + width < scrollX) {
            this.bookcase2.x = this.bookcase1.x + Phaser.Math.Between(width, width + 800);
        }

        this.bookcase1.setVisible(!this.isOverlaps(this.bookcase1, this.windows));
        this.bookcase2.setVisible(!this.isOverlaps(this.bookcase2, this.windows));
    }

    isOverlaps(newObject: Phaser.GameObjects.Image, existingObject: Phaser.GameObjects.Image[]) : boolean  {
        return  !!existingObject.find(ob=>{
            return ob.visible && Math.abs(newObject.x - ob.x) <= newObject.width
        })
    }

    private handleOverlapCoins(mouse: Mouse, coin: Phaser.Physics.Arcade.Sprite) {
        this.coins.killAndHide(coin);
        if(coin.body) coin.body.enable = false;
        this.emitter.emit(EmitKeys.FindCoin);
    }

    private teleportBack() {
        const maxX = 1700;
        const scrollX = this.cameras.main.scrollX;
        if (scrollX >= maxX) {
            this.mouse.x -= maxX;
            this.mouseHole.x -= maxX;
            this.windows.forEach(value => value.x -= maxX);
            this.bookcases.forEach(value => value.x -= maxX);
            this.laserObstacle.moveLaserTo(this.laserObstacle.x - maxX, this.laserObstacle.y);
            this.dot.x -= maxX;
            this.coins.children.each(entry => {
                const body = entry.body as Phaser.Physics.Arcade.StaticBody;
                entry.x -= maxX;
                body.updateFromGameObject();

            })

        }
    }
}

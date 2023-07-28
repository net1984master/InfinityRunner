import Phaser from 'phaser';
import TextureKeys from '../consts/TextureKeys';
import Container = Phaser.GameObjects.Container;

export default class LaserObstacle extends Phaser.GameObjects.Container{
    // private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    declare body : Phaser.Physics.Arcade.StaticBody;
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        // this.body = this.body as Phaser.Physics.Arcade.StaticBody;

        const top = scene.add.image(0,0,TextureKeys.LaserEnd)
            .setOrigin(0.5,0);
        const middle = scene.add.image(0,top.y + top.displayHeight, TextureKeys.Laser)
            .setOrigin(0.5,0);
        middle.setDisplaySize(middle.width, 200);
        const bottom = scene.add.image(0,middle.y + middle.displayHeight,TextureKeys.LaserEnd)
            .setOrigin(0.5,0)
            .setFlipY(true);
        this.add([top,middle,bottom]);

        scene.physics.add.existing(this, true);
        const width = top.displayWidth;
        const height = top.displayHeight + middle.displayHeight + bottom.displayHeight;

        this.body.setSize(width * 0.2, height * 0.9);
        //debugger
        //body.updateCenter();
        this.body.x = x - this.body.width * 0.5;
        this.body.y = y + this.body.height * 0.055;
//        this.cursors = scene.input.keyboard?.createCursorKeys();
    }

    public moveLaserTo(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.body.x = x - this.body.width * 0.5;
        this.body.y = y + this.body.height * 0.055;
   }

    // getCenter() {
    //     return {x:500,y:100};
    // }

    // i : integer = 0;
    // preUpdate() {
    //     if (this.cursors?.right.isDown) {
    //         const body = this.body as Phaser.Physics.Arcade.StaticBody;
    //         this.i--;
    //         // body.setSize(body.width + this.i, body.height,false);
    //         body.x = 500 + this.i;
    //         console.log(this.i);
    //     }
    // }
}

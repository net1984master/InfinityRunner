import Phaser from 'phaser';
import TextureKeys from '../consts/TextureKeys';
import SceneKeys from '../consts/SceneKeys';
import AnimationKeys from '../consts/AnimationKeys';

export default class Pleloader extends Phaser.Scene {

    constructor() {
        super(SceneKeys.Preloader);
    }

    preload() {
        this.load.image(TextureKeys.Background,'house/bg_repeat_340x640.png')
        this.load.image(TextureKeys.MouseHole,'house/object_mousehole.png')
        this.load.image(TextureKeys.Window1,'house/object_window1.png')
        this.load.image(TextureKeys.Window2,'house/object_window2.png')
        this.load.image(TextureKeys.Bookcase1,'house/object_bookcase1.png')
        this.load.image(TextureKeys.Bookcase2,'house/object_bookcase2.png')
        this.load.image(TextureKeys.Laser,'house/object_laser.png')
        this.load.image(TextureKeys.LaserEnd,'house/object_laser_end.png')
        this.load.image(TextureKeys.Dot,'house/dot.png')
        this.load.image(TextureKeys.Coin,'house/object_coin.png')
        this.load.atlas(TextureKeys.Mouse,'mouse/mouse.png','mouse/mouse.json')
    }

    create() {






        // this.anims.create({
        //     key: AnimationKeys.MouseDead,
        //     frames: [
        //         {key: TextureKeys.Mouse, frame: 'rocketmouse_dead02.png'},
        //         {key: TextureKeys.Mouse, frame: 'rocketmouse_dead02.png'},
        //     ],
        //     frameRate: 10,
        //     repeat: 1
        // })



        // setTimeout(() => this.scene.start('game'), 1000);
       this.scene.start(SceneKeys.Game);
    }
}

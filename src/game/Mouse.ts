import Phaser from 'phaser';
import TextureKeys from '../consts/TextureKeys';
import AnimationKeys from '../consts/AnimationKeys';
import SceneKeys from '../consts/SceneKeys';
import EventDispatcher from '../utils/EventDispatcher';
import EmitKeys from '../consts/EmitKeys';
enum MouseState {
    Runned,
    Killed,
    Dead
}
export default class Mouse extends Phaser.GameObjects.Container {
    private mouseState:MouseState = MouseState.Runned;
    private o!:Phaser.GameObjects.Sprite;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    private flame: Phaser.GameObjects.Sprite;
    private mouse: Phaser.GameObjects.Sprite;
    private emitter!: EventDispatcher;
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);

        this.cursors = scene.input.keyboard?.createCursorKeys();
        this.mouse = scene.add.sprite(0, 0, TextureKeys.Mouse)
            // .setOrigin(0.5, 1)
            .setOrigin(0, 0);
        this.flame = scene.add.sprite(8,108, TextureKeys.Mouse);
        this.createAnimations();
        this.mouse.play(AnimationKeys.MouseRun);
        this.flame.play(AnimationKeys.FlameOn);
        this.add(this.flame);
        this.o = this.flame;
        this.add(this.mouse);


        scene.physics.add.existing(this);
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setSize(this.mouse.width * 0.5, this.mouse.height * 0.7);
        body.setOffset(this.mouse.width * 0.3,15)
        // body.setOffset(mouse.width * -0.5, -mouse.height);
        this.emitter = EventDispatcher.getInstance();
    }

    private createAnimations() {
        this.mouse.anims.create({
            key: AnimationKeys.MouseRun,
            frames: this.mouse.anims.generateFrameNames(TextureKeys.Mouse,{
                start: 1,
                end: 4,
                prefix: 'rocketmouse_run',
                suffix: '.png',
                zeroPad: 2
            }),
            frameRate: 10,
            repeat: -1,
        });

        this.mouse.anims.create({
            key: AnimationKeys.MouseDead,
            frames: this.mouse.anims.generateFrameNames(TextureKeys.Mouse, {
                start: 1,
                end: 2,
                prefix: 'rocketmouse_dead',
                suffix: '.png',
                zeroPad: 2
            }),
            frameRate: 10,
        });

        this.mouse.anims.create({
            key: AnimationKeys.MouseFly,
            frames: [{key: TextureKeys.Mouse,frame: 'rocketmouse_fly01.png.png'}]
        });
        this.mouse.anims.create({
            key: AnimationKeys.MouseFall,
            frames: [{key: TextureKeys.Mouse,frame: 'rocketmouse_fall01.png'}]
        });

        this.flame.anims.create({
            key: AnimationKeys.FlameOn,
            frames: this.flame.anims.generateFrameNames(TextureKeys.Mouse, {
                start: 1,
                end: 2,
                prefix: 'flame',
                suffix: '.png',
            }),
            frameRate: 10,
            repeat: -1,
        })
    }

    preUpdate() {
        const body = this.body as Phaser.Physics.Arcade.Body;
        switch (this.mouseState) {
            case MouseState.Runned: {
                if (this.cursors?.space.isDown) {
                    body.setAccelerationY(-600);
                    this.enableJetpack(true);
                    this.mouse.play(AnimationKeys.MouseFly,true);
                }else{
                    body.setAccelerationY(0);
                    this.enableJetpack(false);
                }

                if (this.cursors?.left.isDown) {
                    body.setAccelerationX(-200);
                    // body.setVelocityX(0);
                }else {
                    body.setAccelerationX(0);
                    body.setVelocityX(200);
                }

                if(body.blocked.down) {
                    this.mouse.play(AnimationKeys.MouseRun, true);
                } else if (body.velocity.y > 0) {
                    this.mouse.play(AnimationKeys.MouseFall, true);
                }
                break;
            }
            case MouseState.Killed: {
                body.setVelocityX(body.velocity.x *= 0.99);
                if (body.velocity.x <= 5) this.mouseState = MouseState.Dead;
                break
            }
            case MouseState.Dead: {
                body.setVelocityX(0);
                if(!this.scene.scene.isActive(SceneKeys.GameOver))
                {
                    console.log('DEAD');
                    this.emitter.emit(EmitKeys.MouseDead);
                }
                break;
            }
        }
    }

    enableJetpack(enabled: boolean) {
        this.flame.setVisible(enabled);
    }

    kill() {
        if (this.mouseState !== MouseState.Runned) return;
        console.log('KILLLL');
        this.mouseState = MouseState.Killed;
        const body = this.body as Phaser.Physics.Arcade.Body;
        this.mouse.play(AnimationKeys.MouseDead);
        body.setVelocity(1000, 0);
        body.setAccelerationY(0);
        this.enableJetpack(false);
    }

    up() {
        this.o.y--;
    }
    down() {
        this.o.y++;
    }
    left(){
        this.o.x--;
    }
    right() {
        this.o.x++;
    }
}

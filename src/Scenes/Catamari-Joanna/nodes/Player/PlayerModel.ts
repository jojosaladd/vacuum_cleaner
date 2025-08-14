import {ASerializable, Mat3, Mat4, Polygon2D, V2, Vec2, ATexture} from "../../../../anigraph";
import {TexturedPolygon2DModel} from "../../../../anigraph/starter/nodes/textured";
import {GameConfigs} from "../../CatamariGameConfigs";
import {GameChatacter2DModel} from "../GameChatacter2DModel";

const HEADWIDTH = 0.5;
const HEADHEIGHT =  0.5;


@ASerializable("PlayerModel")
export class PlayerModel extends GameChatacter2DModel {
    _velocity:Vec2;
    _rotationVelocity:number;
    get velocity(){
        return this._velocity;
    }
    set velocity(value:Vec2){
        this._velocity = value;
    }
    get rotationVelocity(){
        return this._rotationVelocity;
    }
    set rotationVelocity(value:number){
        this._rotationVelocity = value;
    }


    constructor(transform?: Mat3, textureMatrix?: Mat3 | Mat4) {

        super(undefined, transform);
        // super(undefined, transform, textureMatrix);
        this._velocity=V2();
        this._rotationVelocity = 0;


        this._setVerts(
            Polygon2D.FromLists([
                V2(-HEADWIDTH, -HEADHEIGHT),
                V2(HEADWIDTH, -HEADHEIGHT),
                V2(HEADWIDTH, HEADHEIGHT),
                V2(-HEADWIDTH, HEADHEIGHT)
            ])
        )
        // this.setTextureMatrix(Mat4.From2DMat3(Mat3.Scale2D(100)));

        this.setTextureMatrix(this.textureMatrix.times(Mat3.Scale2D([1/HEADWIDTH, 1/HEADHEIGHT]).Mat4From2DH()));
    }
    timeUpdate(t:number) {
        super.timeUpdate(t)
        // this.transform.position = this.transform.position.plus(this.velocity);
        // this.transform.rotation = this.transform.rotation+this.rotationVelocity;
        // this.signalTransformUpdate();
        this.setTransform(
            this.transform.getMatrix().times(
                Mat3.Rotation(
                    this.rotationVelocity)
                    .times(Mat3.Translation2D(this.velocity)
                    )
            )
        );
    }


    onRightTurn(){
        this.rotationVelocity=-GameConfigs.PLAYER_TURNSPEED;
    }
    onLeftTurn(){
        this.rotationVelocity=GameConfigs.PLAYER_TURNSPEED;
    }
    onMoveForward(){
        this.velocity = V2(0,GameConfigs.PLAYER_MOVESPEED);
    }
    onMoveBackward(){
        this.velocity = V2(0,-GameConfigs.PLAYER_MOVESPEED);
    }

    onMoveRight(){
        // Positive x-axis movement
        this.velocity = V2(GameConfigs.PLAYER_MOVESPEED, 0);
    }

    onMoveLeft(){
        // Negative x-axis movement
        this.velocity = V2(-GameConfigs.PLAYER_MOVESPEED, 0);
    }

    // onHaltRight(){
    //     this.rotationVelocity = Math.max(0,this.rotationVelocity);
    // }
    // onHaltLeft(){
    //     this.rotationVelocity = Math.min(0,this.rotationVelocity);
    // }
    onHaltRight(){
        // Ensure that the velocity only stops rightward movement (positive x-direction)
        this.velocity = V2(Math.min(0, this.velocity.x), 0);
    }

    onHaltLeft(){
        // Ensure that the velocity only stops leftward movement (negative x-direction)
        this.velocity = V2(Math.max(0, this.velocity.x), 0);
    }

    onHaltForward(){
        //this.rotationVelocity = Math.min(0,this.rotationVelocity);
        this.velocity = V2(0,Math.min(0,this.velocity.y));
    }
    onHaltBackward(){
        this.velocity = V2(0,Math.max(0,this.velocity.y));
    }


}

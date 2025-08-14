import {GameChatacter2DModel} from "../GameChatacter2DModel";
import {TrashModel} from "../Trash";
import {ParticleModel} from "../Particle";
import {Vec2, Mat3, ASerializable, Mat4, V2, Polygon2D, GetAppState} from "../../../../anigraph";
import {VacuumConfigs} from "../../VacuumConfigs";

const HEADWIDTH =  2.2;//2.589;
const HEADHEIGHT = 2.2;//2.5 ;

@ASerializable("PlayerModel")
export class PlayerModel extends GameChatacter2DModel {
    trashBagSize: number = 1;
    vacuumActive: boolean = false;
    isFacingLeft: boolean = true;
    particles: ParticleModel[] = []; // Store collected particles
    _velocity: Vec2;
    _rotationVelocity: number;
    lastDirection: Vec2;

    get velocity() {
        return this._velocity;
    }

    set velocity(value: Vec2) {
        this._velocity = value;
    }

    get rotationVelocity() {
        return this._rotationVelocity;
    }

    set rotationVelocity(value: number) {
        this._rotationVelocity = value;
    }

    constructor(transform?: Mat3, textureMatrix?: Mat3 | Mat4) {
        super(undefined, transform);

        // Initialize default values
        this._velocity = V2(); // Initialize velocity to zero vector
        this._rotationVelocity = 0; // Initialize rotation velocity to zero
        this.lastDirection = V2(-1, 0);

        // Set up the player model's shape
        this._setVerts(
            Polygon2D.FromLists([
                V2(-HEADWIDTH, -HEADHEIGHT),
                V2(HEADWIDTH, -HEADHEIGHT),
                V2(HEADWIDTH, HEADHEIGHT),
                V2(-HEADWIDTH, HEADHEIGHT)
            ])
        );

        // Adjust texture scaling to fit the player's shape
        this.setTextureMatrix(this.textureMatrix.times(Mat3.Scale2D([1 / HEADWIDTH, 1 / HEADHEIGHT]).Mat4From2DH()));

    }

    timeUpdate(t: number) {
        super.timeUpdate(t);
        // Update position and rotation based on velocity and rotation velocity
        // let appState = GetAppState();
        // appState.setState("capacity", t); //need to update later
        // appState.updateComponents()

        this.setTransform(
            this.transform.getMatrix().times(
                Mat3.Rotation(this.rotationVelocity)
                    .times(Mat3.Translation2D(this.velocity))
            )
        );
    }

    activateVacuum() {
        this.vacuumActive = true;
    }

    deactivateVacuum() {
        this.vacuumActive = false;
    }

    collectTrash(trash: TrashModel) {
        if (trash.isBeingSucked) {
            return;
        }

        trash.isBeingSucked = true;
        const particleCount = 20;

        // Create particles from the trash
        for (let i = 0; i < particleCount; i++) {
            const trashTransform = trash.getWorldTransform2D();
            const trashPosition = trashTransform.c2.xy;

          //  const particle = new ParticleModel(trashPosition);
        //    this.particles.push(particle);

            // Add particle to the scene (assuming 'this.parent' is valid)
        //     if (this.parent) {
        // //        this.parent.addChild(particle);
        //     }
        }

        // Remove trash from the scene hierarchy safely
        if (trash.parent) {
            trash.parent.removeChild(trash);
        }


       // this.trashBagSize += 0.5; // Increase the trash bag size
    }

    // explodeTrashBag() {
    //     for (const particle of this.particles) {
    //         particle.velocity = Vec2.Random().times(5);
    //     }
    //     this.trashBagSize = 1;
    //     this.particles = [];
    // }

    // Movement and turning methods
    onMoveForward() {
        this.velocity = V2(0, VacuumConfigs.PLAYER_MOVESPEED);
    }

    onMoveBackward() {
        this.velocity = V2(0, -VacuumConfigs.PLAYER_MOVESPEED);
    }

    onMoveRight() {
        // Positive x-axis movement
        this.velocity = V2(VacuumConfigs.PLAYER_MOVESPEED, 0);
        this.lastDirection = V2(1, 0);
    }

    onMoveLeft() {
        // Negative x-axis movement
        this.velocity = V2(-VacuumConfigs.PLAYER_MOVESPEED, 0);
        this.lastDirection = V2(-1, 0);
    }

    onHaltRight() {
        // Ensure that the velocity only stops rightward movement (positive x-direction)
        this.velocity = V2(Math.min(0, this.velocity.x), 0);

    }

    onHaltLeft() {
        // Ensure that the velocity only stops leftward movement (negative x-direction)
        this.velocity = V2(Math.max(0, this.velocity.x), 0);

    }

    onHaltForward() {
        //this.rotationVelocity = Math.min(0,this.rotationVelocity);
        this.velocity = V2(0, Math.min(0, this.velocity.y));
    }

    onHaltBackward() {
        this.velocity = V2(0, Math.max(0, this.velocity.y));
    }
}
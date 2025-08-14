import {
    ASerializable,
    Mat3,
    Polygon2D,
    Random,
    Vec2,
    Point2DH,
    Vec2DH,
    ASceneModel, V2
} from "../../../../anigraph";
import {TexturedPolygon2DModel} from "../../../../anigraph/starter/nodes/textured";
import {GameChatacter2DModel} from "../../../Catamari/nodes/GameChatacter2DModel";
import {VacuumSceneModel} from "../../VacuumSceneModel";

//@ASerializable("TrashModel")

const T_WIDTH = 0.4;
const T_HEIGHT = 0.4;

export class TrashModel extends GameChatacter2DModel {
    isBeingSucked: boolean = false;
    _currentDestination: Vec2;
    _orientation: Vec2;
    speed: number = 0.05;

    constructor(verts?: Polygon2D, transform?: Mat3, ...args: any[]) {
        super(verts, transform, ...args);
        this._currentDestination = new Vec2();
        this._orientation = new Vec2(1, 0);
        this._setVerts(
            Polygon2D.FromLists([
                V2(-T_WIDTH, -T_HEIGHT),
                V2(T_WIDTH, -T_HEIGHT),
                V2(T_WIDTH, T_HEIGHT),
                V2(-T_WIDTH, T_HEIGHT)
            ])
        );
        this.setTextureMatrix(this.textureMatrix.times(Mat3.Scale2D([1 / T_WIDTH, 1 / T_HEIGHT]).Mat4From2DH()));

        this.reWander();
    }

    // Wander logic, similar to CatModel
    reWander(scale?: number) {
        scale = scale ?? 10;
        let currentPosition = this.transform.getPosition().Point2D;
        this._currentDestination = currentPosition.plus(Vec2.Random([-0.5, 0.5]).times(scale * 0.2));
        if (this._currentDestination.L2() > scale) {
            this._currentDestination = Vec2.Random([-0.5, 0.5]).times(scale);
        }
    }

    timeUpdate(t: number) {
        let delta_t = t - this.lastUpdateTime;
        if (delta_t > 1 || delta_t < 0) {
            delta_t = 0;
        }
        super.timeUpdate(t);

        if (!(this.parent instanceof ASceneModel)) {
            this.signalGeometryUpdate();
        } else {
            if (this.isBeingSucked && this.parent instanceof VacuumSceneModel) {
                // Get the vacuum position from the vacuum range
                const vacuumPosition = this.parent.vacuumRange.getWorldTransform2D().c2.xy;
                let currentPosition = this.transform.getMatrix().c2.xy;

                // Calculate the direction toward the vacuum
                const directionToVacuum = vacuumPosition.minus(currentPosition).getNormalized();

                // Adjust speed based on the distance to make the trash move toward the vacuum
                const speedTowardsVacuum = this.speed * 50; // You can adjust this multiplier to control how fast the trash moves when being sucked
                const newPosition = currentPosition.plus(directionToVacuum.times(speedTowardsVacuum * delta_t));

                // Apply the new position to the trash model
                let newTransform = Mat3.Translation2D(newPosition);

                // Apply scaling transformation to shrink the trash while it's being sucked
                const scaleFactor = 0.95; // Adjust this to control the rate of shrinking
                const scaleMatrix = Mat3.Scale2D(scaleFactor);
                newTransform = newTransform.times(scaleMatrix);

                // Update the transform of the trash
                this.setTransform(newTransform);
            } else {
                // Normal wandering logic when not being sucked
                let mat3Transform = this.transform.getMatrix();
                let currentPosition = mat3Transform.c2.xy;
                let accel = this._currentDestination.minus(currentPosition);
                if (accel.L2() < 1) {
                    this.reWander();
                }
                let accelnorm = accel.getNormalized();
                this._orientation = this._orientation.plus(accelnorm.times(0.3)).getNormalized();
                let vnorm = accel.getNormalized();
                let xnorm = Mat3.Rotation(-Math.PI * 0.5).times(vnorm);
                let placement = Mat3.FromColumns(
                    Vec2DH(xnorm),
                    Vec2DH(this._orientation),
                    Point2DH(currentPosition.plus(vnorm.times(this.speed * delta_t)))
                );
                this.setTransform(placement);
            }
        }
    }
}
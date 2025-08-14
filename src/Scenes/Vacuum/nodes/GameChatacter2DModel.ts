import {TexturedPolygon2DModel} from "../../../anigraph/starter/nodes/textured";
import {Mat3} from "../../../anigraph";
import {Polygon2DModel} from "../../../anigraph/starter/nodes/polygon2D";

export class GameChatacter2DModel extends TexturedPolygon2DModel {
    lastUpdateTime: number = 0;

    timeUpdate(t: number) {
        this.lastUpdateTime = t;
    }

    /**
     * Adds the provided Polygon2DModel as a child and sets the child's parent to be this.
     * @param newChild
     */
    adoptChild(newChild: Polygon2DModel) {
        newChild.reparent(this);
    }



    getWorldTransform(): Mat3 {
        return this.getWorldTransform2D();
    }
}
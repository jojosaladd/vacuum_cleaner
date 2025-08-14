import {TexturedPolygon2DView} from "../../../../anigraph/starter/nodes/textured";
import {TrashModel} from "./TrashModel";
import {Mat3} from "../../../../anigraph";

export class TrashView extends TexturedPolygon2DView {
    get model(): TrashModel {
        return this._model as TrashModel;
    }

    update() {
        super.update();
        if (this.model.isBeingSucked) {
            const currentTransform = this.model.getWorldTransform2D()
            const scaleFactor = 0.95;
            const scaleMatrix = Mat3.Scale2D(scaleFactor);

            // Apply the scaling transformation
            this.model.setTransform(currentTransform.times(scaleMatrix));
        }
    }
}
import {
    ASerializable,
    Vec2,
    Mat3,
    Polygon2D,
    Mat4,
    V2,
    A2DMeshModelPRSA,
    VertexArray2D,
    NodeTransform2D,
    GetAppState,
    DefaultMaterials,
    ATexture,
    AShaderMaterial
} from "../../../../anigraph";
import {TexturedPolygon2DModel} from "../../../../anigraph/starter/nodes/textured";
import {GameChatacter2DModel} from "../GameChatacter2DModel";
const HEADWIDTH =  1.7;//2.589;
const HEADHEIGHT = 1.7;//2.5 ;

@ASerializable("TrashBagModel")
export class TrashBagModel extends GameChatacter2DModel {


    constructor(transform?: Mat3, textureMatrix?: Mat3 | Mat4) {
        super(undefined, transform);

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



    // increaseSize() {
    //     const currentTransform = this.getWorldTransform2D(); // Get the current transform matrix
    //     const scaleFactor = 1.1; // Scale by 10% increase
    //     const scaleMatrix = Mat3.Scale2D(scaleFactor);
    //
    //     // Update the transform with the scaling
    //     this.setTransform(currentTransform.times(scaleMatrix));
    // }
}
import {
    ANodeModel2D, ANodeModel2DPRSA,
    AppState,
    ASerializable,
    Color, GetAppState,
    NodeTransform2D,
    Polygon2D,
    V2,
    Vec2
} from "../../../anigraph";


/**
 * If you create a custom model, it is important to add the @Serializable decordator with the name of the model.
 * This automates a lot of otherwise painful stuff.
 */
@ASerializable("MyCustomModel")
export class MyCustomModel extends ANodeModel2D{
    /**
     * This is how you would signal a custom update event
     */
    signalCustomUpdate(){
        this.signalEvent("CustomUpdateKey");
    }

    /**
     * This is what you would use to add a listener to the custom update event
     * @param callback
     * @param handle
     * @returns {AEventCallbackSwitch}
     */
    addCustomUpdateListener(callback: (...args: any[]) => void, handle?: string){
        return this.addEventListener("CustomUpdateKey", callback, handle);
    }


    constructor(verts?: Polygon2D, transform?: NodeTransform2D, ...args: any[]) {
        super(verts, transform?transform.getMatrix():transform, ...args);

        /**
         * If we wanted to subscribe to the custom event updates
         */

        // const self = this;
        // this.subscribe(
        //     this.addCustomUpdateListener(()=>{
        //         console.log("custom update event happened!")
        //         console.log(self);
        //     }), "CustomUpdateSubscriptionHandle"
        // )

        /**
         * if we wanted to unsubscribe to the custom event updates:
         */
        // this.unsubscribe("CustomUpdateSubscriptionHandle");


    }
}

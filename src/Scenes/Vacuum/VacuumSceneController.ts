import { VacuumSceneModel } from "./VacuumSceneModel";
import { App2DSceneController } from "../../anigraph/starter/App2D/App2DSceneController";
import { ASceneInteractionMode } from "../../anigraph/starter";
import {
    GetAppState,
    AGLRenderWindow,
    AGLContext,
    AInteractionEvent,
    AKeyboardInteraction,
    ANodeModel, ANodeView, ADragInteraction, A2DMeshView, AppState
} from "../../anigraph";
import {PlayerModel, PlayerView, TrashBagModel, TrashBagView, TrashModel, TrashView,ParticleModel,ParticleView} from "./nodes";
import {Polygon2DModel, Polygon2DView} from "../../anigraph/starter/nodes/polygon2D";
import {LabCatFloationgHeadModel} from "../Example2/nodes/LabCatFloatingHead/LabCatFloationgHeadModel";
import {GameChatacter2DModel} from "./nodes/GameChatacter2DModel";
import React from "react";

export class VacuumSceneController extends App2DSceneController {
    mainInteractionMode!: ASceneInteractionMode;

    get model(): VacuumSceneModel {
        return this._model as VacuumSceneModel;
    }

    /**
     * Initialize the scene and setup the control panel
     */
    async initScene() {
        super.initScene();
        this.initControlPanelControls();
        await this.model.loadTexture(`./images/conBG.jpg`, "BG1");// Load the texture with the scene model
        await this.model.loadTexture(`./images/moonBG.jpg`, "BG2");// Load the texture with the scene model
        await this.model.loadTexture(`./images/woodBG.jpg`, "BG3");// Load the texture with the scene model
        await this.model.loadTexture(`./images/litterboxBG.jpg`, "BG4");// Load the texture with the scene model

        this.view.setBackgroundTexture(this.model.getTexture("BG1"));// Set the texture as your background

    }

    /**
     * Sets up control panel controls for vacuum actions
     */
    initControlPanelControls() {
        const appState = GetAppState();
        // Listen to changes in the app state and update the background dynamically
        // Add a state value listener to listen for changes to the "Background" state

       // });
        // appState.addButton("Activate Vacuum", () => {
        //     this.model.player.activateVacuum();
        //     console.log("Vacuum activated from control panel");
        // });

        // appState.addButton("Explode Trash Bag", () => {
        //     this.model.player.explodeTrashBag();
        //     console.log("Trash bag exploded from control panel");
        // });
    }

    updateBackGround(){
        let bg = GetAppState().getState("Background");
        // Check the selected background and apply the corresponding texture
        if (bg === "Concrete") {
            this.view.setBackgroundTexture(this.model.getTexture("BG1")); // Assuming "BG1" is the concrete texture
        } else if (bg === "Wood Floor") {
            this.view.setBackgroundTexture(this.model.getTexture("BG3")); // Assuming "BG2" is the wood floor texture
        } else if (bg === "Moon") {
            this.view.setBackgroundTexture(this.model.getTexture("BG2")); // Assuming "BG3" is the moon texture
        } else if (bg === "Litter Box") {
            this.view.setBackgroundTexture(this.model.getTexture("BG4")); // Assuming "BG4" is the litter box texture
        }    }

    initModelViewSpecs() {
        super.initModelViewSpecs();
        this.addModelViewSpec(Polygon2DModel, Polygon2DView);
        this.addModelViewSpec(TrashBagModel, TrashBagView);
        this.addModelViewSpec(PlayerModel, PlayerView);
        this.addModelViewSpec(ParticleModel, ParticleView);
    }
    /*
    * @param {ANodeModel} nodeModel
    * @returns {ANodeView}
    */
    createViewForNodeModel(nodeModel: ANodeModel): ANodeView {
        return super.createViewForNodeModel(nodeModel);
    }

    onModelNodeAdded(nodeModel: ANodeModel) {
        // super.onModelNodeAdded(nodeModel);
        let modelViewList = this.getViewListForModel(nodeModel);
        if(modelViewList.length<1){
            this._onNewModelNodeAdded(nodeModel);
            modelViewList = this.getViewListForModel(nodeModel);
        }
        if(modelViewList.length > 0) {
            let view = modelViewList[0];
            if (nodeModel.parent instanceof ANodeModel) {
                let parentView = this.getViewListForModel(nodeModel.parent)[0];
                view.setParentView(parentView);
            } else if(nodeModel.parent === this.model) {
                view.setParentView(this.view);
            }
        }
    }

    /**
     * Initializes interactions such as keyboard events for player control and vacuum activation
     */
    initInteractions() {
        super.initInteractions();
        const self = this;

        this.mainInteractionMode = new ASceneInteractionMode(
            "MainInteractionMode",
            this,
            {
                onKeyDown: (event: AInteractionEvent, interaction: AKeyboardInteraction) => {
                    event.preventDefault();
                    console.log(event.key)
                    if (event.key.toLowerCase() === "v") {
                        this.model.player.vacuumActive = true;
                        this.model.activateVacuum();
                        this.model.playVacuumSound();
                 //       this.model.particleMode();
                    }

                    // if (event.key ==="p"){
                    //     const playerPosition = this.model.player.getWorldTransform2D().c2.xy; // Get player's current world position
                    //     this.model.createParticles(playerPosition); // Create particles at player's position
                    //     console.log('Particles created at player position:', playerPosition);                    }

                    if (event.key.toLowerCase() === "e" && this.model.isPlayerNearTrashBag()) {
                        this.model.numTrashintheBag += this.model.numCollectedTrash;
                        this.model.numCollectedTrash =0;
                        this.model.playTrashEmptySound();
                        this.model.updateTrashBagImage();
                    }

                    // M- MUSIC PLAY
                    if (event.key.toLowerCase() === "m"){
                        this.model.toggleBackgroundMusic()
                    }

                    // C - OUTFIT & VACUUM CHANGE
                    if (event.key.toLowerCase()  === "c") {
                        this.model.togglePlayerTexture();
                        this.model.playDingSound();
                        this.model.player.isFacingLeft = true;
                    }
                    if (event.key.toLowerCase()  === "r") {
                        this.model.resetGame();
                    }

                    // Arrow keys for movement
                    if (event.key === "ArrowRight") {
                        this.model.player.onMoveRight();
                        this.model.updatePlayerR();
                        this.model.player.isFacingLeft = false;
                    }
                    if (event.key === "ArrowLeft") {
                        this.model.player.onMoveLeft();
                        this.model.updatePlayerL();
                        this.model.player.isFacingLeft = true;
                    }
                    if (event.key === "ArrowUp") {
                        this.model.player.onMoveForward();
                    }
                    if (event.key === "ArrowDown") {
                        this.model.player.onMoveBackward();
                    }
                },
                onKeyUp: (event: AInteractionEvent, interaction: AKeyboardInteraction) => {
                    if (event.key.toLowerCase()  === "v") {
                        this.model.player.vacuumActive = false;
                        this.model.stopVacuumSound();

                        let particleSystems = this.model.particleSystems;
                        console.log("List of particles: ", particleSystems);

                        // Loop through each particle system and remove it from the scene
                        for (let p of particleSystems) {
                            console.log("Removing this particle: ", p);
                            this.model.removeChild(p);  // Remove from the scene graph
                            p.release();  // Optionally release any resources held by the particle system
                        }

                        // Clear the particleSystems array
                        this.model.particleSystems = [];
                        console.log("List of particles NOW: ", this.model.particleSystems);

                    }

                    if (event.key === "ArrowRight") {
                        this.model.player.onHaltRight();
                    }
                    if (event.key === "ArrowLeft") {
                        this.model.player.onHaltLeft();
                    }
                    if (event.key === "ArrowUp") {
                        this.model.player.onHaltForward();
                    }
                    if (event.key === "ArrowDown") {
                        this.model.player.onHaltBackward();
                    }
                },
                onDragStart:(event:AInteractionEvent, interaction:ADragInteraction)=>{
                    let ndcCursor = event.ndcCursor;
                    if(ndcCursor) {
                        interaction.cursorStartPosition = this.model.worldPointFromNDCCursor(ndcCursor);
                    }
                },
                onDragMove:(event:AInteractionEvent, interaction:ADragInteraction)=>{
                    let cursorPosition = event.ndcCursor?.times(this.model.sceneScale);
                    let keysDownState = self.getKeysDownState();
                    if(cursorPosition) {
                        if(event.shiftKey){
                        }
                        if (keysDownState['x']) {
                        } else if (keysDownState['y']) {
                        } else {
                        }
                    }
                },
                onDragEnd:(event:AInteractionEvent, interaction:ADragInteraction)=>{},
                onClick:(event:AInteractionEvent)=>{
                    this.eventTarget.focus();
                    let cursorPosition = event.ndcCursor?.times(this.model.sceneScale);
                    let keysDownState = self.getKeysDownState();
                    if(cursorPosition) {
                        if (keysDownState['x']) {
                            console.log(`Click with "x" key at ${cursorPosition.elements[0], cursorPosition.elements[1]}`)
                        } else {
                            console.log(`Click at ${cursorPosition.elements[0], cursorPosition.elements[1]}`)
                        }
                        if(event.shiftKey){
                            console.log(`Click with shift key at ${cursorPosition.elements[0], cursorPosition.elements[1]}`)
                        }
                    }
                    this.model.signalComponentUpdate();
                }
            }
        );

        // Set and define the interaction mode
        this.defineInteractionMode("MainInteractionMode", this.mainInteractionMode);
        this.setCurrentInteractionMode("MainInteractionMode");
    }

    /**
     * Resize handling (if needed) and animation callbacks
     */
    onResize(renderWindow?: AGLRenderWindow): void {
        if (renderWindow && renderWindow.container !== undefined) {
            this.renderer.setSize(renderWindow.container.clientWidth, renderWindow.container.clientHeight);
            this.cameraModel.onCanvasResize(renderWindow.container.clientWidth, renderWindow.container.clientHeight);
        }
    }

    onAnimationFrameCallback(context: AGLContext) {
        this.model.timeUpdate(this.model.clock.time);
        this.updateBackGround();
        super.onAnimationFrameCallback(context);
    }
}
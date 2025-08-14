import {
    AMaterialManager, ASerializable, ATexture,
    GetAppState, Mat3, Vec2, Polygon2D, Mat4, V2, Random, AppState, DefaultMaterials, Color, ANodeModel
} from "../../anigraph";
import {App2DSceneModel} from "../../anigraph/starter/App2D/App2DSceneModel";
import {PlayerModel, TrashBagModel, TrashModel, ParticleModel} from "./nodes";
import {Polygon2DModel} from "../../anigraph/starter/nodes/polygon2D";
import {LabCatFloationgHeadModel} from "../Example2/nodes/LabCatFloatingHead/LabCatFloationgHeadModel";
import React from "react";
import {ExampleParticleSystemModel} from "../Example2/nodes";
import {VacuumConfigs} from "./VacuumConfigs";

let nErrors=0

@ASerializable("VacuumSceneModel")
export class VacuumSceneModel extends App2DSceneModel {
    player!: PlayerModel;
    trashItems: TrashModel[] = [];
    playerTextures: ATexture[] = [];
    trashTextures: ATexture[] = [];
    particleSystem!:ParticleModel;
    particleSystems: ParticleModel[] = [];
    vacuumRange!: Polygon2DModel;
    trashbag!:TrashBagModel;
    trashbagTextures: ATexture[] = [];
    numCollectedTrash: number = 0;
    numTrashintheBag: number = 0;


    initAppState(appState:AppState){
        //appState.addSliderIfMissing(ExampleParticleSystemModel.ParticleOrbitKey, 7, 0, 10, 0.001);
        appState.addColorControl(ExampleParticleSystemModel.ParticleColorKey, Color.FromString("#a1a1a1"));
        appState.addSliderControl("Player Speed", 0.03, 0.01, 0.10, 0.01);
        appState.setSelectionControl("Background","Concrete",["Concrete","Wood Floor","Moon","Litter Box"]);

    }

    updatePlayerSpeed(){
        VacuumConfigs.PLAYER_MOVESPEED = GetAppState().getState("Player Speed");
    }

    // updateBackGround(){
    //     let bg = GetAppState().getState("Background");
    //     // Check the selected background and apply the corresponding texture
    //     if (bg === "Concrete") {
    //         this.view.setBackgroundTexture(this.model.getTexture("BG1")); // Assuming "BG1" is the concrete texture
    //     } else if (bg === "Wood Floor") {
    //         this.view.setBackgroundTexture(this.model.getTexture("BG2")); // Assuming "BG2" is the wood floor texture
    //     } else if (bg === "Moon") {
    //         this.view.setBackgroundTexture(this.model.getTexture("BG3")); // Assuming "BG3" is the moon texture
    //     } else if (bg === "Litter Box") {
    //         this.view.setBackgroundTexture(this.model.getTexture("BG4")); // Assuming "BG4" is the litter box texture
    //     }    }

    createVacuumRange() {
        let vacuumRangeVerts = [
            new Vec2(-0.2, -0.5),
            new Vec2(0.2, -0.5),
            new Vec2(0.2, 0.5),
            new Vec2(-0.2, 0.5)
        ];

        let transparentColor = new Color(1.0, 1.0, 1.0, 0);
        let colors = new Array(vacuumRangeVerts.length).fill(transparentColor);

        let vacuumPolygon = Polygon2D.FromLists(vacuumRangeVerts, colors);
        this.vacuumRange = new Polygon2DModel(vacuumPolygon);
        this.vacuumRange.setMaterial(GetAppState().CreateMaterial(AMaterialManager.DefaultMaterials.RGBA_SHADER));

        this.addChild(this.vacuumRange);
    }

    updateVacuumRange() {
        // Get the player's world position and facing direction
        const playerPosition = this.player.getWorldTransform2D().c2.xy;

        const distanceInFront = 2.1;

        let vacuumPosition = playerPosition.plus(this.player.lastDirection.times(distanceInFront));

        const offsetY = -0.3;
        vacuumPosition = vacuumPosition.plus(new Vec2(0, offsetY));

        this.vacuumRange.setTransform(Mat3.Translation2D(vacuumPosition));
    }


    activateVacuum() {
        const vacuumPosition = this.vacuumRange.getWorldTransform2D().c2.xy;
        let allTrashCollected = true;
        this.particleMode();
        for (let trash of this.trashItems) {
            if (trash.parent === this) {
                const trashPosition = trash.getWorldTransform2D().c2.xy;
                const toTrash = trashPosition.minus(vacuumPosition);
                const distance = toTrash.L2();

                if (distance < 3 && this.player.vacuumActive) {
                    trash.isBeingSucked = true;

                    if (distance < 1) {
                        this.player.collectTrash(trash);
                        if (trash.parent === this) {
                            this.removeChild(trash);
                            this.numCollectedTrash += 1;
                            this.trashItems = this.trashItems.filter(item => item !== trash);
                        }
                    } else {
                        allTrashCollected = false;
                    }
                } else {
                    allTrashCollected = false;
                }
            }
        }

        if (allTrashCollected) {
            this.showVictoryScreen();
        }
    }

    playerState: 'default' | 'alternate' = 'default';  // Add this state variable to track the current state
    particleState: 'active' | 'not-active' = 'active';
    backgroundMusic!: HTMLAudioElement;
    isMusicPlaying: boolean = false;
    trashEmptySound!: HTMLAudioElement;  // Add this property for the trash empty sound
    vacuumSound!: HTMLAudioElement;
    victorySound!: HTMLAudioElement;
    dingSound!: HTMLAudioElement;

    get children(): Polygon2DModel[] {
        return this._children as Polygon2DModel[];
    }


    /**
     * This will add variables to the control pannel
     * @param appState
     */

    async PreloadAssets() {
        await super.PreloadAssets();
        let appState = GetAppState();
        await appState.loadShaderMaterialModel(AMaterialManager.DefaultMaterials.RGBA_SHADER);
        await appState.loadShaderMaterialModel(AMaterialManager.DefaultMaterials.TEXTURED2D_SHADER);
        await appState.loadShaderMaterialModel(AMaterialManager.DefaultMaterials.PARTICLE_TEXTURE_2D_SHADER);
        await appState.loadShaderMaterialModel(DefaultMaterials.TEXTURED2D_SHADER);
        await this.loadTexture( "./images/gradientParticle.png", "GaussianSplat")
        // Load trash textures
        for (let i = 1; i <= 20; i++) {
            this.trashTextures.push(await ATexture.LoadAsync(`./images/trash/${i}.png`));
        }

        // Load player texture
        this.playerTextures.push(await ATexture.LoadAsync(`./images/player_0.png`));
        this.playerTextures.push(await ATexture.LoadAsync(`./images/player_0_R.png`));
        this.playerTextures.push(await ATexture.LoadAsync(`./images/player_1.png`));
        this.playerTextures.push(await ATexture.LoadAsync(`./images/player_1_R.png`));

        // Load background music
        this.backgroundMusic = new Audio('audio/bgm.mp3');
        this.backgroundMusic.loop = true; // Music will loop
        this.backgroundMusic.volume = 0.5; // Set the volume
        this.trashEmptySound = new Audio('./audio/trashbag.mp3');
        this.trashEmptySound.volume = 0.8;  // Set the volume as needed
        this.vacuumSound = new Audio('./audio/vacuum.mp3');
        this.vacuumSound.volume = 0.8;  // Set the volume as needed
        this.victorySound = new Audio('./audio/victory.mp3');
        this.vacuumSound.volume = 0.8;  // Set the volume as needed
        this.dingSound = new Audio('./audio/ding.mp3');
        this.dingSound.volume = 0.8;  // Set the volume as needed

        // Load trashbag
        this.trashbagTextures.push(await ATexture.LoadAsync(`./images/trashcan/trashcan-0.png`));
        this.trashbagTextures.push(await ATexture.LoadAsync(`./images/trashcan/trashcan-1.png`));
        this.trashbagTextures.push(await ATexture.LoadAsync(`./images/trashcan/trashcan-2.png`));


    }

    togglePlayerTexture() {
        if (this.playerState === 'default') {
            this.playerState = 'alternate';
            this.player.material.setTexture('color', this.playerTextures[2]); // Set to player_1
        } else {
            this.playerState = 'default';
            this.player.material.setTexture('color', this.playerTextures[0]); // Set to player_0
        }
    }

    async initScene() {
        let appState = GetAppState();

        this.createPlayer();
        this.createTrashItems();
        this.createVacuumRange();
        this.createTrashBag();
        this.signalComponentUpdate();

        appState.setState("capacity", 0);
        appState.setReactGUIContentFunction(
            (props:{appState:AppState})=>{
                return (
                    <React.Fragment>
                        {`Trash Collected in Vacuum: ${props.appState.getState("capacity")}`}
                    </React.Fragment>
                );
            }
        );

    }

    particleMode(){

        let appState = GetAppState();

        this.particleSystem = new ParticleModel();
        let maxNumParticles = 10;
        this.particleSystem.setVacuumRangePosition(this.vacuumRange.getWorldTransform2D().c2.xy);
        this.particleSystem.initParticles(maxNumParticles,this.player.isFacingLeft); // the number you pass here will be the maximum number of particles you can have at once for this particle system
        let particleMaterial = appState.CreateShaderMaterial(DefaultMaterials.PARTICLE_TEXTURE_2D_SHADER);
        particleMaterial.setUniform("opacityInMatrix", true);
        particleMaterial.setTexture("color", this.getTexture("GaussianSplat"));
        this.particleSystem.setMaterial(particleMaterial)

        //experiment
   //     this.particleSystem.setVacuumRangePosition(this.vacuumRange.getWorldTransform2D().c2.xy);
        // Let's add the particle system, which will cause the scene controller to create a particle system view and add
        // it to our scene graph. Pretty sweet.
        this.addChild(this.particleSystem);
        this.particleSystems.push(this.particleSystem);
        this.particleSystem.zValue = -0.01;

    }

    particleOff(){

    }
    showVictoryScreen() {
        const appState = GetAppState();
        appState.setReactGUIContentFunction(
            (props:{appState:AppState})=>{
                return (
                    <React.Fragment>
                    <span style={{ color: "green" }}>
                        {`Victory! All trash collected! Press r to restart.`}
                    </span>
                    </React.Fragment>
                );
            }
        );

        if (this.victorySound) {
            this.victorySound.play().catch(error => {
                console.error("Failed to play victory sound:", error);
            });
        }

        // appState.setReactGUIBottomContentFunction(() => (
        //     <div style={{ textAlign: "center", fontSize: "32px", color: "green" }}>
        //         Victory! All trash collected! Press r to restart.
        //     </div>
        // ));
    }

    resetGame() {
        this.removeChildren()
        this.removeChildren()
        this.removeChildren()
        this.removeChildren()
        this.removeChildren()
        this.numCollectedTrash = 0;
        this.numTrashintheBag = 0;
        this.trashItems = [];
        this.createPlayer();
        this.createTrashItems();
        this.createVacuumRange();
        this.createTrashBag();
        this.signalComponentUpdate();
        GetAppState().setState("capacity", 0);
        GetAppState().setSelectionControl("Background","Concrete",["Concrete","Wood Floor","Moon","Litter Box"]);

        GetAppState().setReactGUIContentFunction(
            (props:{appState:AppState})=>{
                return (
                    <React.Fragment>
                        {`Trash Collected in Vacuum: ${props.appState.getState("capacity")}`}
                    </React.Fragment>
                );
            }
        );
    }

    createTrashBag(){
        this.trashbag = new TrashBagModel();
        this.trashbag.setMaterial(GetAppState().CreateMaterial(AMaterialManager.DefaultMaterials.TEXTURED2D_SHADER));
        this.trashbag.material.setTexture('color', this.trashbagTextures[0]);
        this.trashbag.zValue = 0.001;
        const bottomLeftPosition = new Vec2(-8.5, -8);  // Adjust based on scene scale if necessary
        const translationMatrix = Mat3.Translation2D(bottomLeftPosition);
        this.trashbag.setTransform(translationMatrix);

        this.addChild(this.trashbag);
    }

    toggleBackgroundMusic() {
        if (this.isMusicPlaying) {
            this.backgroundMusic.pause();  // Pause the music if it's playing
            this.isMusicPlaying = false;   //Flag
        } else {
            this.backgroundMusic.play().catch((error) => {
                console.error("Failed to play background music:", error);
            });
            this.isMusicPlaying = true;  //Flag
        }
    }

    playVacuumSound(){
        if (this.vacuumSound) {
            this.vacuumSound.play().catch(error => {
                console.error("Failed to play vacuum sound:", error);
            });
        }
    }

    playDingSound(){
        if (this.dingSound) {
            this.dingSound.play().catch(error => {
                console.error("Failed to play ding sound:", error);
            });
        }
    }
    stopVacuumSound() {
        if (this.vacuumSound) {
            this.vacuumSound.pause();
            this.vacuumSound.currentTime = 0; // Reset to start
        }
    }

    playTrashEmptySound() {
        if (this.trashEmptySound) {
            this.trashEmptySound.play().catch(error => {
                console.error("Failed to play trash empty sound:", error);
            });
        }
    }

    createPlayer() {
        this.player = new PlayerModel();
        this.player.setMaterial(GetAppState().CreateMaterial(AMaterialManager.DefaultMaterials.TEXTURED2D_SHADER));
        this.player.material.setTexture('color', this.playerTextures[0]);
        this.player.zValue = 0.001;
        this.addChild(this.player);
    }


    updatePlayerR(){
        if (this.playerState === 'default') {
            this.player.material.setTexture('color', this.playerTextures[1]); // player_0_R
        } else {
            this.player.material.setTexture('color', this.playerTextures[3]); // player_1_R
        }
    }

    updateTrashBagImage(){
        if (this.numTrashintheBag >= 40){
            this.trashbag.material.setTexture('color', this.trashbagTextures[2]);
        }
        else if (this.numTrashintheBag >= 20){
            this.trashbag.material.setTexture('color', this.trashbagTextures[1]);
        }
        else {
            this.trashbag.material.setTexture('color', this.trashbagTextures[0]);
        }

    }
    updatePlayerL(){
        if (this.playerState === 'default') {
            this.player.material.setTexture('color', this.playerTextures[0]); // player_0
        } else {
            this.player.material.setTexture('color', this.playerTextures[2]); // player_1
        }
    }

    createTrashItems() {
        for (let i = 0; i < 50; i++) {
            this.addTrash();
        }
    }

    isPlayerNearTrashBag(): boolean {
        // Get the player's world position
        const playerPosition = this.player.getWorldTransform2D().c2.xy;

        // Get the trash bag's world position
        const trashBagPosition = this.trashbag.getWorldTransform2D().c2.xy;

        // Calculate the Euclidean distance between player and trash bag
        const dx = playerPosition.x - trashBagPosition.x;
        const dy = playerPosition.y - trashBagPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Define a threshold for "near" or "colliding"
        const threshold = 2.0;  // You can adjust this value

        // Return true if the distance is less than the threshold, false otherwise
        return distance <= threshold;
    }

    async addTrash(transform?: Mat3, verts?: Polygon2D, texture?: ATexture) {
        if (!texture) {
            let textureIndex = Random.randInt([0, this.trashTextures.length - 1]);
            texture = this.trashTextures[textureIndex];
        }

        let newTrash: TrashModel;
        if (verts) {
            newTrash = new TrashModel(verts, transform,
                Mat4.From2DMat3(
                    Mat3.Translation2D(V2(0.5, 0.5)).times(
                        Mat3.Scale2D(0.5)
                    )
                )
            );
        } else {
            let buffer = 0.1; // increasing
            let randomVec = Vec2.Random().minus(V2(0.5, 0.5)).times(this.sceneScale * (1 - buffer));
            let randomVecNormalized = randomVec.getNormalized();
// Apply a random distance with some added control based on buffer and scene scale
            const minDistance = 0.9;
            const maxDistance = this.sceneScale * (1 - buffer);  // Constrained max distance
            const randomDistance = minDistance + Math.random() * (maxDistance - minDistance);

// Multiply normalized vector by random distance to get the final position
            let spreadVec = randomVecNormalized.times(randomDistance);

            const T_WIDTH = 0.4;  // You can adjust these values if needed
            const T_HEIGHT = 0.4;

            let squareVerts: Vec2[] = [
                new Vec2(-T_WIDTH, -T_HEIGHT),  // Bottom-left corner
                new Vec2(T_WIDTH, -T_HEIGHT),   // Bottom-right corner
                new Vec2(T_WIDTH, T_HEIGHT),    // Top-right corner
                new Vec2(-T_WIDTH, T_HEIGHT)    // Top-left corner
            ];
            let polygon = Polygon2D.FromLists(squareVerts);
            newTrash = new TrashModel(polygon, transform ?? Mat3.Translation2D(spreadVec));

            // newTrash = new TrashModel(polygon, transform ?? Mat3.Translation2D(
            //     randomVec.plus(randomVecNormalized.times(buffer * this.sceneScale))
            // ));
        }

        newTrash.zValue = -0.001;
        newTrash.setMaterial(GetAppState().CreateMaterial(AMaterialManager.DefaultMaterials.TEXTURED2D_SHADER));
        newTrash.setTexture(texture);

        this.trashItems.push(newTrash);
        this.addChild(newTrash);

        if (transform) {
            newTrash.setTransform(transform);
        }
    }

    timeUpdate(t: number) {
        this.updateVacuumRange();
        this.updatePlayerSpeed();

        try {
            if (this.player.vacuumActive) {
                this.activateVacuum();
            } else {
                for (let trash of this.trashItems) {
                    if (trash.isBeingSucked) {
                        trash.isBeingSucked = false;
                    }
                }
            }

            this.player.timeUpdate(t);

            // for (let particle of this.particles) {
            //     particle.timeUpdate(t);
            // }
            this.mapOverDescendants((d)=>{
                (d as ANodeModel).timeUpdate(t);
            })

            GetAppState().setState("capacity", this.numCollectedTrash);
            GetAppState().updateComponents();

            for (let trash of this.trashItems) {
                trash.timeUpdate(t);
            }
        } catch (e) {
            if (nErrors < 1) {
                console.error(e);
                nErrors += 1;
            }
        }
    }
}
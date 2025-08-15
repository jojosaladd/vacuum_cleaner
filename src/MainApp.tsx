import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import React, {useEffect, useState} from "react";
import {MainComponent, GUIComponent} from "./Component";
import {Layout, FullLayout, GUIBottomComponent, DefaultAppComponent} from "./Component";
import {CreateAppState, ControlPanel} from "./anigraph";

//import AppClasses from "./Scenes/MainScene"
//import AppClasses from "./Scenes/Catamari";
//import AppClasses from "./Scenes/Catamari-Joanna";
// import AppClasses from "./Scenes/Example1"
 //import AppClasses from "./Scenes/Example2"
// import AppClasses from "./Scenes/Example3"
import AppClasses from "./Scenes/Vacuum";

const AppComponentClass = AppClasses.ComponentClass??DefaultAppComponent;

const sceneModel = new AppClasses.SceneModelClass();
const appState = CreateAppState(sceneModel);
sceneModel.initAppState(appState);

appState.createMainRenderWindow(AppClasses.SceneControllerClass);
const initConfirmation = appState.confirmInitialized();

// const LayoutToUse = FullLayout;
const LayoutToUse = Layout;



function MainApp() {
    useEffect(() => {

        initConfirmation.then(()=> {
                console.log("Main Initialized.");
                // appState.addSliderIfMissing("exampleValue", 0, 0, 1, 0.001);
                appState.updateControlPanel();
            }
        );
    }, []);


    return (
        <div>
            <div className={"control-panel-parent"}>
                <ControlPanel appState={appState}></ControlPanel>
            </div>
            <LayoutToUse>
                <div className="container-fluid" id="anigraph-app-div">
                    {/* flex row that NEVER wraps */}
                    <div className="row g-3 flex-nowrap align-items-start">

                        {/* Main scene: fixed 9/12 */}
                        <div className="col-9 anigraph-component-container">
                            <MainComponent
                                renderWindow={appState.mainRenderWindow}
                                name={appState.sceneModel.name}
                            >
                                <GUIComponent appState={appState}>
                                    <AppComponentClass model={sceneModel}/>
                                </GUIComponent>
                            </MainComponent>
                        </div>

                        {/* Keyboard: fixed 3/12 */}
                        <div
                            className="col-3 d-flex justify-content-center align-items-start"
                            style={{marginTop: "250px"}}  // tweak px value
                        >
                            <img
                                src={process.env.PUBLIC_URL + "/images/keyboard.png"}
                                alt="Keyboard Controls"
                                style={{ width: "400px", height: "auto" }}   // 👈 stays 300px wide

                            />
                        </div>

                    </div>
                </div>
            </LayoutToUse>
        </div>
    );
}

export default MainApp;

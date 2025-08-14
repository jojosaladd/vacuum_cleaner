import { VacuumSceneModel } from './VacuumSceneModel';
import { VacuumSceneController } from './VacuumSceneController';
import {VacuumComponent} from "./VacuumComponent";

export * from "./VacuumSceneModel";
export * from "./VacuumSceneController";

export default {
    SceneModelClass: VacuumSceneModel,
    SceneControllerClass: VacuumSceneController,
    ComponentClass: VacuumComponent
}
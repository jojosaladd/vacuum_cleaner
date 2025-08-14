import {
    ASerializable,
    Vec2,
    Mat3,
    Polygon2D,
    Random,
    GetAppState,
    AMaterialManager, V2
} from "../../../../anigraph";
import {Polygon2DModel} from "../../../../anigraph/starter/nodes/polygon2D";
import {
    Instanced2DParticleSystemModel
} from "../../../../anigraph/starter/nodes/instancedParticlesSystem/Instanced2DParticleSystemModel";
import {Custom2DParticle} from "./Custom2DParticle";
import {AParticleEnums} from "../../../../anigraph/physics/particles/AParticleEnums";

@ASerializable("ParticleModel")
export class ParticleModel extends Instanced2DParticleSystemModel<Custom2DParticle> {

    /**
     * TrashBag system model for using instanced particles
     * "Instanced" graphics are ones where the same geometry is rendered many times, possibly with minor variations (e.g., in position and color). Each render of the object is an "instance". This is handled as a special case so that the program can share common data across the different instances, which helps scale up to a larger number of instances more efficiently. This makes it great for something like a particle system, where you have many copies of the same geometry.
     * Note that with instanced graphics, you need to specify the number of instances you plan to use up front so that we can allocate resources on the GPU to store whatever attributes vary between instances. This means that instead of creating new particles and destroying old ones as the application progresses, you will create a fixed budget of particles up front and simply hide any particles you aren't using. Then, when you want to "create" a new particle, you take one of the hidden particles, set its attributed, and un-hide it.
     */


        // These are just keys for some simple app state properties we will control via sliders in this demo.
    static ParticleOrbitKey = "ParticleOrbit"
    static ParticleColorKey = "Particle Color"
    vacuumrange_position!: Vec2;


    /**
     * If you plan to simulate things with time steps, you are going to want to keep track of the last clock time when you updated so you can calculate how much time has passed between `timeUpdate(t)` calls
     * @type {number}
     */
    lastUpdateTime:number=0;

    /**
     * timeUpdate
     * This will update the particle system at time t. You may consider splitting this into an `updateParticles` function that iterates through all the particles and updates them individually, and an `emit` function that resets a given particle when some condition is met.
     * We often want to know the current time when a particle is emitted. You may also consider writing a third function called something like `launchParticle` that finds a particle to recycle and explicitly sets a condition that will lead to it being emitted the next time `timeUpdate` is called. This will let you trigger the emission of a particle from a controller interaction (e.g., keyboard or mouse event), which runs asynchronously with your model.
     * @param t
     * @param args
     */

    /**
     * Sets the position of the vacuum range.
     *
     * @param pos - The new position for the vacuum range
     */
    setVacuumRangePosition(pos: Vec2) {
        this.vacuumrange_position = pos;
    }


    timeUpdate(t: number, ...args: any[]) {
        super.timeUpdate(t, ...args);

        // Let's retrieve the current vacuum position
        let vacuumPosition = this.vacuumrange_position;
        let color = GetAppState().getState(ParticleModel.ParticleColorKey);
        //let colorShift = 2*Math.PI/(this.nParticles-1);

        let deltaTime = t - this.lastUpdateTime;

        for (let p = 0; p < this.nParticles; p++) {
            let particle = this.particles[p];
            this.particles[p].color = color;
            //this.particles[p].color = color.GetSpun(colorShift*p); // we will set the color to start with our selected color, but shift the hue of each subsequent particle in the orbit

            if (particle.visible) {
                // Update the particle's position and move it toward the vacuum cleaner
                particle.vacuumPosition = vacuumPosition;
                particle.update(deltaTime);
            } else {
                // Recycle the particle: reset it with a new position and velocity
                let startDistance = 2;
                let randomAngle = Math.random() * Math.PI * 2;
                let spawnPosition = vacuumPosition.plus(new Vec2(Math.cos(randomAngle), Math.sin(randomAngle)).times(startDistance));

           //     particle.reset(spawnPosition, V2(), Math.random() * 2 + 1, vacuumPosition);
            }
        }

        // Signal that the particle data has changed so the view will refresh
        this.signalParticlesUpdated();
        this.lastUpdateTime = t;
    }

    /**
     * Initialize the particles
     * If you want to add and remove particles on the fly, you should still initialize nParticles to the maximum you plan to use at any one point. Then you should create and add that many in initParticles, and set the `visible` parameter of any you aren't using right away to false. Then, later, when you want to turn a particle on, you can set `particle.visible=true` and assign its other attributes accordingly.
     * @param nParticles the maximum number of particles you might want to use
     */
    initParticles(nParticles?: number, facingDirection: boolean = true) {
        if (nParticles === undefined) {
            nParticles = AParticleEnums.DEFAULT_MAX_N_PARTICLES;
        }
        for (let i = 0; i < nParticles; i++) {
           let newp = new Custom2DParticle();
           let startDistance = 2;
           let randomAngle =0;

            if (facingDirection) {  // If true, face left
                randomAngle = Math.random() * (Math.PI / 3) + (Math.PI - Math.PI / 6);  // Middle third, left-facing
            } else {  // If false, face right
                randomAngle = Math.random() * (Math.PI / 3) - Math.PI / 6;  // Middle third, right-facing
            }

            //let randomAngle = Math.random() * Math.PI + Math.PI / 2;

            let spawnPosition = this.vacuumrange_position.plus(new Vec2(Math.cos(randomAngle), Math.sin(randomAngle)).times(startDistance));
            let speed = Math.random() * 2 + 1;

            newp.reset(spawnPosition, V2(), Math.random() * 2 + 1, this.vacuumrange_position);

            this.addParticle(newp);
        }
        this.signalParticlesUpdated();
    }


}
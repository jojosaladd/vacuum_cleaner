import {Color, Particle2D, V2, Vec2} from "../../../../anigraph";

/**
 * Our custom 2D particle class. It must implement the Particle2D interface, which means it has `position`, `depth`, and `visible` properties.
 * You can customize your particle class with additional properties and functions.
 */
export class Custom2DParticle implements Particle2D{
    mass:number;
    position:Vec2;
    velocity:Vec2;
    visible:boolean=true;
    radius:number;
    depth:number=0;
    color:Color;
    opacity: number;
    age: number;
    lifetime: number;
    distanceMoved: number = 0;
    lastUpdateTime:number=0;
    maxDistance: number = 0.025; // maybe
    vacuumPosition: Vec2;
    /**
     * You can show or hide particles by setting their `visible` parameter.
     * This is important, because with instanced particles, you will need to create all the particles you plan to use up front so that the GPU can allocate the appropriate resources. This means that if you want fewer than this maximum number, you just hide the particles you aren't using.
     */
    show(){
        this.visible = true;
    }
    hide(){
        this.visible = false;
    }

    constructor(position?:Vec2, velocity?:Vec2, mass?:number, radius?:number, vacuumPosition?: Vec2){
        this.position = position??V2();
        this.velocity = velocity??V2();
        this.mass = mass??1;
        this.radius = radius??1;
        this.color = new Color(170 / 255, 170 / 255, 170 / 255);
        this.visible = true;
        this.opacity = 1;
        this.age = 0;
        this.lifetime = 3;
        this.vacuumPosition = vacuumPosition ?? V2();
    }


    reset(position: Vec2, velocity: Vec2, lifetime: number, vacuumPosition: Vec2) {
        this.position = position;
        this.velocity = velocity;
        this.lifetime = lifetime;
        this.mass = 1;
        this.radius = 1;
        this.color = new Color(170 / 255, 170 / 255, 170 / 255);
       // this.color = Color.Random();
        this.age = 0;
        this.visible = true;  // Make particle visible
        this.color.a = 1.0;   // Reset opacity to full
        this.distanceMoved = 0;  // Reset the distance moved
        this.vacuumPosition = vacuumPosition;
    }

    update(deltaTime: number) {
        if (this.visible) {

            let directionToVacuum = this.vacuumPosition.minus(this.position).getNormalized();

            this.velocity = directionToVacuum.times(0.5);
            this.position = this.position.plus(this.velocity.times(0.26));
            this.age += 0.26;

            //this.color = new Color(170 / 255, 170 / 255, 170 / 255);

            //this.color.a = 1.0 - (this.age / this.lifetime);

            if (this.age >= this.lifetime) {
                this.visible = false;

            }
        }
    }
}

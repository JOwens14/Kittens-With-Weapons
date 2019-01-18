import {Vec2} from './math.js';
import {controllerUpdate} from './Controllers.js';

export class Trait{
	constructor(name){
		this.NAME = name;
	}
	update() {
		console.warn('unhandled');
	}
}


export default class Entity {
    constructor(name) {
				this.Ename = name;
        this.pos = new Vec2(0, 0);
        this.vel = new Vec2(0, 0);
        this.size = new Vec2(0,0);

        this.traits = [];
    }

    addTrait(trait) {
    	this.traits.push(trait);
    	this[trait.NAME] = trait;
    }
    update(deltaTime) {
			//console.log(this.Ename);
			if (this.Ename === 'character') {
				controllerUpdate(this, 0); //updating controller for character 1
			}
			else if (this.Ename === 'enemy') {
				controllerUpdate(this, 1); //updating controller for enemy
			}



    	this.traits.forEach(trait => {
    		trait.update(this,deltaTime);
    	});
    }
}

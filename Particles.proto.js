let ParticleSystem = (function() {
	function ParticleSystem(config) {
        
        // this.gravity = new Vector(0,0.0003);
        // this.wind = new Vector(0.0005,0);
        this.particles = [];

        this.init(config);
	};
	
	ParticleSystem.prototype = {
		init: function(config) {
            this.createStage();
            this.createParticles(config.number);
            this.createAffector();
            this.update();
        },

        createStage: function(){
            this.stage = document.getElementById("stage");
            this.stage.addEventListener("click",(e)=>{this.clickEvent(e)});
            this.context = this.stage.getContext("2d");
            this.context.strokeStyle = "#FFF";
        },

        clickEvent: function(e){
            let coords = this.getStageClick(e);
            for(var i = 0; i < this.particles.length; i++){
                if((this.particles[i].position.x - coords.x < 5) && (this.particles[i].position.y - coords.y < 5)){
                    console.log(this.particles[i]);
                }
            }
        },

        getStageClick: function(e){
            let stageRect = this.stage.getBoundingClientRect();
            let x = e.clientX - stageRect.left;
            let y = e.clientY - stageRect.top;
            return {"x":x,"y":y};
        },

        createParticles: function(number, emitter){
            for(var i = 0; i < number; i++){
                this.createParticle(
                    {
                        "x": 100,
                        "y": 100,
                        "vx": Math.random() * 5 - 2,
                        "vy": Math.random() * 5 - 2,
                        "ax": 0,
                        "ay": 0,
                        "maxSpeed": 3,
                        "a": 1,
                        "size": 2,
                        "r": 255,
                        "g": 1,
                        "b": 1
                    }
                );
            }
        },

        createParticle: function(config){
            this.particles.push(new Particle(config));
        },

        createAffector: function(config){
            this.particles.push(new Particle(
                {
                    "x": 300,
                    "y": 300,
                    "vx": 0,
                    "vy": 0,
                    "ax": 0,
                    "ay": 0,
                    "maxSpeed": 3,
                    "a": 1,
                    "size": 3,
                    "type": "a",
                    "mass": 5
               }
            ));
            // this.particles.push(new Particle(
            //     {
            //         "x": 300,
            //         "y": 300,
            //         "vx": 0,
            //         "vy": 0,
            //         "ax": 0,
            //         "ay": 0,
            //         "maxSpeed": 3,
            //         "a": 1,
            //         "size": 4,
            //         "type": "a",
            //         "mass": 5
            //    }
            // ));
               
        },

        update: function(){
            requestAnimationFrame(()=>{this.update();});
            for(var i = 0; i < this.particles.length; i++){
                // this.particles[i].acceleration.add(this.gravity);
                // this.particles[i].acceleration.add(this.wind);
                if(this.particles[i].type == "a"){
                    this.affect(this.particles[i]);
                }
                this.particles[i].update();    
            }
            this._draw();
        },

        affect: function(affector){
            for(var i = 0; i < this.particles.length; i++){
                    let attraction = new Vector();
                    let force = affector.position.subtract(this.particles[i].position);
                    let direction = force.unitise();
                    attraction.add(
                        direction.multiply(affector.mass / force.magnitude())
                    );
                    this.particles[i].velocity.add(attraction);
                
            }
            
        },

        clearRect: function(){
            this.context.fillStyle = "rgba(0,0,0,0.1)";
            this.context.fillRect(0,0,this.stage.width,this.stage.height);
        },

        _draw: function(){
            this.clearRect();
            for(var i = 0; i < this.particles.length; i++){
                this.particles[i].draw(this.context);
            }
        }
	};
 
	return ParticleSystem;
}());









































let Vector = (function(){
    function Vector(x,y){
        this.init(x,y);
    };

    Vector.prototype = {
        init: function(x,y){
            this.x = x || 0;
            this.y = y || 0;
        },
        add: function(vector){
            this.x += vector.x;
            this.y += vector.y;
        },
        subtract: function(vector){
            let x = this.x - vector.x;
            let y = this.y - vector.y;

            return new Vector(x,y);
        },
        divide: function(scalar) {
            return new Vector(this.x / scalar, this.y / scalar);
        },
        multiply: function(scalar){
            return new Vector(this.x * scalar, this.y * scalar);
        },
        magnitude: function(){
            return Math.sqrt(this.x * this.x + this.y * this.y)
        },
        unitise: function(){
            return this.divide(this.magnitude());
        }
    };

    return Vector;
}());









































let Particle = (function(){
    function Particle(config){
        //config => attraction,emitter
        this.init(config);
        this.position = new Vector(config.x, config.y);
        this.velocity = new Vector(config.vx, config.vy);
        this.acceleration = new Vector(config.ax, config.ay);
        this.colour = "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
        this.maxSpeed = config.maxSpeed;
        this.type = config.type;
    };

    Particle.prototype = {
        init: function(config){
            this.x = config.x || 0;
            this.y = config.y || 0;
            this.vx = config.vx || 0;
            this.vy = config.vy || 0;
            this.ax = config.ax || 0;
            this.ay = config.ay || 0;
            this.maxSpeed = config.maxSpeed || 3;
            this.lifespan = config.lifespan || 256;
            this.mass = config.mass || 5;
            this.size = config.size || Math.random() * 3;
            this.r = config.r || Math.random() * 255;
            this.g = config.g || Math.random() * 255;
            this.b = config.b || Math.random() * 255;
            this.a = config.a || Math.random() * 255;
        },
        draw: function(context){
            context.fillStyle = this.colour;
            context.fillRect(
                this.position.x,
                this.position.y,
                this.size,
                this.size
            );
        },
        constrain: function(){
            if(this.velocity.x > this.maxSpeed)
                this.velocity.x = this.maxSpeed;
            if(this.velocity.y > this.maxSpeed)
                this.velocity.y = this.maxSpeed;
            if(this.velocity.x < -this.maxSpeed)
                this.velocity.x = -this.maxSpeed;
            if(this.velocity.y < -this.maxSpeed)
                this.velocity.y = -this.maxSpeed;
        },
        bounceWalls: function (){
            if(this.position.x <= 0 || this.position.x >= 1000)
                this.velocity.x *= -1;
            if(this.position.y <= 0 || this.position.y >= 600)
                this.velocity.y *= -1;
        },

        update: function(){
            this.bounceWalls();
            this.constrain();
            this.position.add(this.velocity);
            this.velocity.add(this.acceleration);    
        }
    };

    return Particle;
}());











































let particleSystem = new ParticleSystem(
    {
        "number":5,
        "stage":"stage",
        "emitter":{"x":600,"y":450},
        "gravity":0
    }
);
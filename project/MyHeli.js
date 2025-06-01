import { CGFobject, CGFappearance, CGFtexture } from "../lib/CGF.js";
import { MyCylinder } from "./MyCylinder.js";
import { MySphere } from "./MySphere.js";
import { MyPyramid } from "./MyPyramid.js";
import { MyCube } from "./MyCube.js";

export class MyHeli extends CGFobject {
    constructor(scene, texturesOrColor, quadMaterial) {
        super(scene);
        this.position = { x: 0, z: -18 };
        this.altitude = 11.3; // altura de reset
        this.pitchAngle = 0; // Inclinação em torno do eixo X (radians)
        this.maxPitch = Math.PI / 12; 
        this.pitchSpeed = Math.PI / 4;
        this.lastHorizontalAcceleration = 0;

        this.wasDescending = false;

        this.softReset = false;
        this.resetTarget = {
            position: { x: 0, z: -18 },
            altitude: 11.3,
            orientation: -Math.PI / 2
        };
        this.resetPhase = 0; // 0: rodar, 1: mover, 2: rodar outra vez, 3: altura
        this.resetSpeed = 4; // unidades por segundo para posição
        this.rotationSpeed = Math.PI; // rad/s
        this.altitudeSpeed = 2; // unidades por segundo


        this.orientation = -Math.PI / 2; // ângulo em torno do eixo Y
        this.velocity = { x: 0, z: 0 }; // 2D no plano XZ
        this.targetAltitude = 14;
        this.flying = false;

        this.verticalAcceleration = 0;
        this.verticalVelocity = 0;
        this.verticalMaxSpeed = 5; // unidades por segundo (ajustável)
        this.verticalFriction = 4; // desaceleração automática (ajustável)
        this.verticalBoost = 10; // força aplicada quando pressionas (ajustável)

        // Water bucket properties
        this.bucketFilled = false;
        this.bucketEmpty = true;
        this.bucketPosition = { x: 0, y: -3, z: 0 }; // Position relative to helicopter
        this.bucketRadius = 0.8; // Collision radius for the bucket

        // Water droplets
        this.waterDroplets = [];
        this.dropletLifetime = 5000; // Increased lifetime to 5 seconds
        this.lastDropletTime = 0;
        this.dropletInterval = 50; // Reduced interval for more droplets
        this.droplet = new MySphere(scene, 8, 8); // Create a sphere for droplets
        this.isReleasingWater = false; // Track if water is being released
        this.dropletsPerRelease = 20; // Increased number of droplets for one-time release

        // Rotor rotation properties
        this.mainRotorAngle = 0;
        this.tailRotorAngle = 0;
        this.rotorSpeed = 50; // rotations per second

        this.appearanceInput = texturesOrColor;
        this.quadMaterial = quadMaterial;

        // Partes do helicóptero
        this.body = new MySphere(scene, 32, 16); 
        this.head = new MySphere(scene, 16, 8);
        this.tail = new MySphere(scene, 8, 4);
        this.tophead= new MySphere(scene, 8, 4);
        this.mainRotor = new MyCube(scene, [0, 0, 0, 0], quadMaterial);
        this.tailRotor = new MyCube(scene, [0, 0, 0, 0], quadMaterial);
        this.skid = new MySphere(scene, 8, 2);
        this.bucket = new MyCylinder(scene, 20, 1); // O balde
        this.bucketCable = new MyCylinder(scene, 8, 1); // 8 slices, altura 1

        // Criação com materiais por cor
        this.bodyMaterial = new CGFappearance(scene);
        this.bodyMaterial.setAmbient(0.6, 0.1, 0.1, 1);  // vermelho escuro
        this.bodyMaterial.setDiffuse(0.6, 0.1, 0.1, 1);
        this.bodyMaterial.setSpecular(0.1, 0.1, 0.1, 1);
        this.bodyMaterial.setShininess(10);

        this.bodyTexture = new CGFtexture(this.scene, "images/earth.jpg");
        this.bodyMaterial.setTexture(this.bodyTexture);
        this.bodyMaterial.setTextureWrap("CLAMP_TO_EDGE", "CLAMP_TO_EDGE");

        this.windowMaterial = new CGFappearance(scene);
        this.windowMaterial.setAmbient(0.1, 0.1, 0.3, 1);
        this.windowMaterial.setDiffuse(0.4, 0.4, 0.8, 1);
        this.windowMaterial.setSpecular(0.7, 0.7, 0.9, 1);
        this.windowMaterial.setShininess(100);

        this.bucketMaterial = new CGFappearance(scene);
        this.bucketMaterial.setAmbient(0.3, 0.3, 0.3, 1);
        this.bucketMaterial.setDiffuse(0.5, 0.5, 0.5, 1);
        this.bucketMaterial.setSpecular(0.1, 0.1, 0.1, 1);
        this.bucketMaterial.setShininess(10);
    }

    isLanded() {
        return !this.flying && this.altitude <= 11.3 && Math.abs(this.verticalVelocity) < 0.01;
    }
    
    turn(v) {
        this.orientation += v;
        const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.z ** 2);
        this.velocity.x = speed * Math.sin(this.orientation);
        this.velocity.z = speed * Math.cos(this.orientation);
    }

    isOverLake(lake) {
        const dx = this.position.x - lake.position.x;
        const dz = this.position.z - lake.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        return distance < 2.2 * lake.radius;
    }    
    
    accelerate(v) {
        this.lastHorizontalAcceleration = v; 
    
        const angle = this.orientation + Math.PI / 2;
        const dirX = Math.sin(angle);
        const dirZ = Math.cos(angle);
    
        let speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.z ** 2);
        speed += v;
        if (speed < 0) speed = 0;
    
        this.velocity.x = speed * dirX;
        this.velocity.z = speed * dirZ;
    }

    ascend() {
        if (this.altitude < 15) {
            this.verticalAcceleration = this.verticalBoost;
            if (!this.flying) {
                this.flying = true;
                this.scene.building?.startHelipadBlinking("up");
            }            
        } else {
            this.verticalVelocity = 0;
            this.verticalAcceleration = 0;
        }
    }    
    
    descend() {
        if (this.altitude <= 0) {
            this.altitude = 0;
            this.verticalVelocity = 0;
            this.verticalAcceleration = 0;
        } else {
            this.verticalAcceleration = -this.verticalBoost;
        }
    }    
    
    neutralVertical() {
        this.verticalAcceleration = 0;
    }
    
    
    reset() {
        this.softReset = true;
        this.resetPhase = 0;
    
        this.resetStartOrientation = this.orientation;
        this.resetTarget = {
            position: { x: 0, z: -18 },
            altitude: 11.3,
            orientation: -Math.PI / 2
        };

        // Calculate the angle to face the helipad
        const dx = this.resetTarget.position.x - this.position.x;
        const dz = this.resetTarget.position.z - this.position.z;
        // Add 3PI/2 to make the nose (which is in the opposite direction) point towards the target
        this.resetInitialRotation = Math.atan2(dx, dz) + (3 * Math.PI) / 2;
    }    
    
    update(deltaTime, speedFactor) {
        const delta = deltaTime / 1000;
        const currentTime = Date.now();

        if (this.flying && this.verticalAcceleration === 0 && this.verticalVelocity === 0) {
            this.flying = false; // já não está a subir
        
            // HELIPORTO volta a "normal"
            if (this.scene.building) this.scene.building.resetHelipad?.();
        }

        // Update rotor angles
        if (!this.isLanded()) {
            this.mainRotorAngle += this.rotorSpeed * Math.PI * 2 * delta * speedFactor;
            this.tailRotorAngle += this.rotorSpeed * Math.PI * 2 * delta * speedFactor;
        }


        // Update bucket position relative to helicopter
        this.bucketPosition.x = this.position.x;
        this.bucketPosition.y = this.altitude - 3;
        this.bucketPosition.z = this.position.z;

        // Check for water filling
        if (!this.bucketFilled && this.bucketPosition.y <= 0.5) { // Near water surface
            this.bucketFilled = true;
            this.bucketEmpty = false;
        }

        // Update water droplets
        for (let i = this.waterDroplets.length - 1; i >= 0; i--) {
            const droplet = this.waterDroplets[i];
            droplet.position.x += droplet.velocity.x * delta;
            droplet.position.y += droplet.velocity.y * delta;
            droplet.position.z += droplet.velocity.z * delta;

            // Remove droplets that have fallen below ground or expired
            if (droplet.position.y < -1 || currentTime - droplet.createdAt > this.dropletLifetime) {
                this.waterDroplets.splice(i, 1);
            }
        }

        if (this.softReset) {
            const delta = deltaTime / 1000;
        
            if (this.resetPhase === 0) {
                // Phase 0: First rotate to face the helipad with the nose
                let dAngle = this.resetInitialRotation - this.orientation;
                
                // Normalize angle to [-π, π]
                dAngle = Math.atan2(Math.sin(dAngle), Math.cos(dAngle));
                
                const rotation = Math.sign(dAngle) * Math.min(Math.abs(dAngle), this.rotationSpeed * delta);
                this.orientation += rotation;

                if (Math.abs(dAngle) <= 0.01) {
                    this.resetPhase = 1;
                }
                return;
            }
            
            if (this.resetPhase === 1) {
                // Phase 1: Move to target position
                const dx = this.resetTarget.position.x - this.position.x;
                const dz = this.resetTarget.position.z - this.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                if (dist > 0.05) {
                    const dirX = dx / dist;
                    const dirZ = dz / dist;
                    const move = Math.min(dist, this.resetSpeed * delta);
                    this.position.x += dirX * move;
                    this.position.z += dirZ * move;
                    return;
                } else {
                    this.resetPhase = 2;
                }
            }
        
            if (this.resetPhase === 2) {
                // Phase 2: Final rotation to face the correct direction on the helipad
                let dAngle = this.resetTarget.orientation - this.orientation;
                dAngle = Math.atan2(Math.sin(dAngle), Math.cos(dAngle));
                if (Math.abs(dAngle) > 0.01) {
                    const rotation = Math.sign(dAngle) * Math.min(Math.abs(dAngle), this.rotationSpeed * delta);
                    this.orientation += rotation;
                    return;
                } else {
                    this.resetPhase = 3;
                    this.scene.building?.startHelipadBlinking("down");
                }
            }
        
            if (this.resetPhase === 3) {
                // Phase 3: Adjust altitude
                const dy = this.resetTarget.altitude - this.altitude;
                if (Math.abs(dy) > 0.05) {
                    const moveY = Math.sign(dy) * Math.min(Math.abs(dy), this.altitudeSpeed * delta);
                    this.altitude += moveY;
                    return;
                } else {
                    // Reset complete
                    this.softReset = false;
                    this.velocity = { x: 0, z: 0 };
                    this.verticalVelocity = 0;
                    this.verticalAcceleration = 0;
                }
            }
        
            return;
        }

        // Controlar inclinação com base na última aceleração
        let targetPitch = 0;
        if (this.lastHorizontalAcceleration > 0) {
            targetPitch = -this.maxPitch; // acelerar → inclinar para a frente
        } else if (this.lastHorizontalAcceleration < 0) {
            targetPitch = this.maxPitch; // travar → inclinar para trás
        } else {
            targetPitch = 0; // sem aceleração → voltar ao neutro
        }

        // Ajuste suave
        this.pitchAngle += (targetPitch - this.pitchAngle) * Math.min(1, this.pitchSpeed * delta);
        
                
        // Atualiza posição horizontal (já está correto)
        this.position.x += this.velocity.x * delta * speedFactor;
        this.position.z += this.velocity.z * delta * speedFactor;

        // Aplica aceleração vertical → velocidade vertical
        this.verticalVelocity += this.verticalAcceleration * delta;

        // Aplica fricção quando não há aceleração (para travar suavemente)
        if (this.verticalAcceleration === 0) {
            if (this.verticalVelocity > 0) {
                this.verticalVelocity -= this.verticalFriction * delta;
                if (this.verticalVelocity < 0) this.verticalVelocity = 0;
            } else if (this.verticalVelocity < 0) {
                this.verticalVelocity += this.verticalFriction * delta;
                if (this.verticalVelocity > 0) this.verticalVelocity = 0;
            }
        }

        // Limita a velocidade máxima (em ambas direções)
        this.verticalVelocity = Math.max(-this.verticalMaxSpeed, Math.min(this.verticalVelocity, this.verticalMaxSpeed));

        // Atualiza a altitude
        this.altitude += this.verticalVelocity * delta;

        // Evita que desça abaixo do chão
        if (this.altitude < 0) {
            this.altitude = 0;
            this.verticalVelocity = 0;
        }
    }
    
    // New method to handle water release
    releaseWater() {
        if (this.bucketFilled) {
            // Calculate bucket position in world space
            const bucketWorldX = this.position.x;
            const bucketWorldY = this.altitude - 3;
            const bucketWorldZ = this.position.z;

            // Create multiple droplets with random offsets
            for (let i = 0; i < this.dropletsPerRelease; i++) {
                // Random offset within a radius
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 0.5; // Scatter radius
                const offsetX = Math.cos(angle) * radius;
                const offsetZ = Math.sin(angle) * radius;

                // Random initial velocity with more spread
                const velocityX = (Math.random() - 0.5) * 4; // Increased spread
                const velocityZ = (Math.random() - 0.5) * 4; // Increased spread

                this.waterDroplets.push({
                    position: { 
                        x: bucketWorldX + offsetX,
                        y: bucketWorldY,
                        z: bucketWorldZ + offsetZ
                    },
                    velocity: { 
                        x: velocityX,
                        y: -5, // Increased falling speed
                        z: velocityZ
                    },
                    createdAt: Date.now()
                });
            }
            
            this.bucketFilled = false;
            this.bucketEmpty = true;
            return true; // Return true to indicate water was released
        }
        return false;
    }

    // New method to stop water release
    stopWaterRelease() {
        this.isReleasingWater = false;
    }

    // New method to check if any water droplet is over fire
    isWaterOverFire(firePosition) {
        if (!firePosition) return false;
        
        // Convert fire position to world space (multiply by 10 since fire is scaled by 10)
        const fireWorldX = firePosition.x * 4;
        const fireWorldZ = firePosition.z * 4;

        for (let i = this.waterDroplets.length - 1; i >= 0; i--) {
            const droplet = this.waterDroplets[i];
            
            // Calculate distance in world space
            const distance = Math.sqrt(
                Math.pow(droplet.position.x - fireWorldX, 2) +
                Math.pow(droplet.position.z - fireWorldZ, 2)
            );
            
            // Increased threshold for more forgiving hit detection and adjusted height check
            if (distance < 8 && droplet.position.y < 5) { // Increased distance threshold from 4 to 8 and height from 3 to 5
                console.log("Fire hit! Distance:", distance, "at position:", { x: fireWorldX, z: fireWorldZ });
                // Remove the droplet that hit the fire
                this.waterDroplets.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    display() {
        this.scene.pushMatrix();
        this.scene.translate(this.position.x, this.altitude, this.position.z);
        this.scene.rotate(this.orientation, 0, 1, 0); // orientação yaw
        this.scene.rotate(this.pitchAngle, 0, 0, 1);  // inclinação pitch
               
        // Display water droplets
        this.windowMaterial.apply(); // Use blue material for droplets
        for (const droplet of this.waterDroplets) {
            this.scene.pushMatrix();
            this.scene.translate(droplet.position.x - this.position.x, 
                               droplet.position.y - this.altitude, 
                               droplet.position.z - this.position.z);
            this.scene.scale(0.15, 0.15, 0.15); // Slightly larger droplets
            this.droplet.display();
            this.scene.popMatrix();
        }

        // Cabo/fio do balde (cilindro fino no centro)
        this.scene.pushMatrix();
        this.scene.translate(0, -3, 0); // começa por baixo do helicóptero
        this.scene.scale(0.05, 2.0, 0.05); // fio fino e comprido
        this.bucketMaterial.apply(); // mesmo material cinzento
        this.bucketCable.display();
        this.scene.popMatrix();

        // Balde de água
        this.scene.pushMatrix();
        this.scene.translate(0, -3, 0);       // Posição vertical sob o helicóptero
        this.scene.scale(0.8, 0.8, 0.8);        // Escala para parecer um balde
        if (this.bucketFilled) {
            // Change bucket appearance when filled with water
            this.windowMaterial.apply(); // Use window material (blue) when filled
        } else {
            this.bucketMaterial.apply();
        }
        this.bucket.display();
        this.scene.popMatrix();

        // Corpo principal
        this.scene.pushMatrix();
        this.scene.scale(2, 1.2, 0.8);
        this.bodyMaterial.apply();       // usa o material correto
        this.body.display();
        this.scene.popMatrix();

        // Cabine
        this.scene.pushMatrix();
        this.scene.translate(1.7, 0, 0);
        this.scene.scale(0.7, 0.5, 0.5);
        this.windowMaterial.apply();
        this.head.display();
        this.scene.popMatrix();

        // My TophEAD
        this.scene.pushMatrix();
        this.scene.translate(0, 1.2, 0);
        this.scene.scale(0.2, 0.2, 0.2);
        this.windowMaterial.apply();
        this.tophead.display();
        this.scene.popMatrix();

        // Cauda (corrigida)
        this.scene.pushMatrix();
        this.scene.translate(-1.8, 0, 0); // estava -2.2
        this.scene.scale(1.5, 0.3, 0.3);  // estava 2.5
        this.bodyMaterial.apply();
        this.tail.display();
        this.scene.popMatrix();

        // Hélice superior (corrigida)
        this.scene.pushMatrix();
        this.scene.translate(0, 1.4, 0); // estava a 0.6, agora sobre o corpo
        this.scene.rotate(this.mainRotorAngle, 0, 1, 0);
        this.scene.scale(4, 0.05, 0.2);
        this.bodyMaterial.apply();
        this.mainRotor.display();
        this.scene.popMatrix();

        // Hélice traseira (tail rotor)
        this.scene.pushMatrix();
        this.scene.translate(-3.3, 0, 0);
        this.scene.rotate(this.tailRotorAngle, 1, 0, 0);
        this.scene.scale(0.1, 0.2, 1);
        this.bodyMaterial.apply();
        this.tailRotor.display();
        this.scene.popMatrix();

       // Trem de aterragem - barra direita (inclinada para fora)
        this.scene.pushMatrix();
        this.scene.translate(0, -0.9, 0.5); // centro do corpo, lado direito
        this.scene.rotate(-Math.PI / 2, 1, 0, 1);  // deita no plano XZ
        this.scene.scale(0.6, 0.2, 0.2); // comprimento da barra + espessura
        this.bodyMaterial.apply();
        this.skid.display();
        this.scene.popMatrix();

        // Trem de aterragem - barra esquerda (inclinada para fora)
        this.scene.pushMatrix();
        this.scene.translate(0, -0.9, -0.5); // centro do corpo, lado esquerdo
        this.scene.rotate(Math.PI / 2, 1, 0, 1);   // deita no plano XZ
        this.scene.scale(0.6, 0.2, 0.2);
        this.bodyMaterial.apply();
        this.skid.display();
        this.scene.popMatrix();

        this.scene.popMatrix();
    }
}

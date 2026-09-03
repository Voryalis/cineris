export class Camera { 
  yaw = 0; 
  pitch = 0; 

  rotate(yawDelta, pitchDelta) {
    this.yaw = (this.yaw + yawDelta) % (Math.PI * 2); 
    this.pitch = Math.max(-0.5 * Math.PI, Math.min(0.5, this.pitch + pitchDelta)); 
  }
}
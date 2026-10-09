const LOUVER_WIDTH = 88;
const LOUVER_THICKNESS = 6;
const LOUVER_ANGLE_DEGREES = 45;
const angle = LOUVER_ANGLE_DEGREES * Math.PI / 180;
const faceHeight = LOUVER_WIDTH * Math.sin(angle) + LOUVER_THICKNESS * Math.cos(angle);
const sectionHeight = 1800;
const pitch = faceHeight;
let count = 0;
for (let bottom = 0; bottom < sectionHeight; bottom += pitch) {
    count++;
}
console.log('faceHeight:', faceHeight);
console.log('count:', count);
console.log('floor:', Math.floor(sectionHeight / faceHeight));

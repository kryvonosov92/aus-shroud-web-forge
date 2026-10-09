import { louverLayout } from './src/features/shroud-builder/louver-layout';
const layout = louverLayout({
    height: 1800,
    louverSectionHeight: 1800,
    depth: 300,
    louverSpacing: 0,
    louverOrientation: 'down'
});
console.log('faceHeight:', layout.faceHeight);
console.log('sections length:', layout.sections.length);
console.log('floor:', Math.floor(1800 / layout.faceHeight));

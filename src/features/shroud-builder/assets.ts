const assets: Record<string, string> = {
  "aws-logo.svg": "/__l5e/assets-v1/149a005d-b10c-4750-998b-73cf0f2cfacb/aws-logo.svg",
  "products/box.webp": "/__l5e/assets-v1/e4216077-a081-4578-aff3-d1644dc04948/box.webp",
  "products/corner.webp": "/__l5e/assets-v1/622c2ce7-7276-4843-8507-d5d95c0c93a7/corner.webp",
  "products/curved.webp": "/__l5e/assets-v1/8169633d-4c1a-45c7-b80a-e764cad2af09/curved.webp",
  "products/hood.webp": "/__l5e/assets-v1/0eb3d97c-a941-44d7-8c3d-9e4ffca71541/hood.webp",
  "products/louvered.webp": "/__l5e/assets-v1/c2e21c91-09d2-4390-acfb-5dcfe4515a1f/louvered.webp",
  "products/modular.webp": "/__l5e/assets-v1/8ae7483f-5c0f-43d3-b1f9-e78b15d45df2/modular.webp",
  "products/round.webp": "/__l5e/assets-v1/c9a547f4-2d88-4e8f-b937-c6f9cafd318b/round.webp",
  "products/tapered.webp": "/__l5e/assets-v1/2b28e8ae-ca5d-4d79-9377-b47727bd03ab/tapered.webp",
  "colours/electro-medium-bronze.webp": "/__l5e/assets-v1/f5af53fb-08f4-4775-adb7-c454d1ce875a/electro-medium-bronze.webp",
  "fonts/inter-400.ttf": "/__l5e/assets-v1/922109c4-3791-4c10-b71d-ef3e26f11764/inter-400.ttf",
  "fonts/inter-600.ttf": "/__l5e/assets-v1/eed12044-97f9-47ef-9942-d7e4375c944e/inter-600.ttf"
};
export const builderAsset = (path: string) => assets[path] ?? "";

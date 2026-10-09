# Project architecture
- Derive louvre blade geometry, fixed blade angle, elevation and actual openness from the shared louver-layout module; keep frame height and louver section height independent, with the section bottom-aligned inside the frame and blade centres at half the projection depth; omit incomplete terminal blades for zero spacing so the model and exports cannot produce flat top strips.
- Keep the Shroud Builder in `src/features/shroud-builder` as a client-side React feature with isolated styles and CDN media; this preserves the existing site while retaining local 3D and PDF exports.
- Keep blog editing in the existing admin area even though public Latest routes are removed; published content is retained for administrators.
- Resolve builder media through the absolute Lovable CDN host so Vercel deployments can load its images and PDF fonts, which Vercel does not serve under local CDN paths.
- Admin rights come from the user_roles table (has_role); storage writes to aws-media and reads of quote-attachments require the admin role, and quote attachments are uploaded server-side by send-quote-email because anonymous uploads can't be tied to an owner.

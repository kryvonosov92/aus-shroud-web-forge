# Project architecture
- Build modular joiners at the panel junctions from one F cross-section, rotated for head and sill connections and shared by live/export geometry; this prevents full-width front strips from replacing corner fittings.
- Reveal louver receiving extrusions during side inspection by fading both jambs; keep physical geometry and other views unchanged.
- Clamp the louver assembly centre to its projected half-depth at offset limits and fit its height below the sloped head; this keeps full-width blades and rectangular extrusions inside the frame in model and exports.
- Derive louvre blade geometry, fixed blade angle, front-referenced offset and receiving-extrusion dimensions from the shared louver-layout module; keep frame height and louver section height independent and bottom-aligned; render closed rectangular extrusion exteriors and only the exposed blade span to conceal inserted ends in both the model and perspective exports, and omit incomplete terminal blades for zero spacing.
- Keep the Shroud Builder in `src/features/shroud-builder` as a client-side React feature with isolated styles and CDN media; this preserves the existing site while retaining local 3D and PDF exports.
- Keep blog editing in the existing admin area even though public Latest routes are removed; published content is retained for administrators.
- Resolve builder media through the absolute Lovable CDN host so Vercel deployments can load its images and PDF fonts, which Vercel does not serve under local CDN paths.
- Admin rights come from the user_roles table (has_role); storage writes to aws-media and reads of quote-attachments require the admin role, and quote attachments are uploaded server-side by send-quote-email because anonymous uploads can't be tied to an owner.

# Project architecture
- Keep the Shroud Builder in `src/features/shroud-builder` as a client-side React feature with isolated styles and CDN media; this preserves the existing site while retaining local 3D and PDF exports.
- Keep blog editing in the existing admin area even though public Latest routes are removed; published content is retained for administrators.

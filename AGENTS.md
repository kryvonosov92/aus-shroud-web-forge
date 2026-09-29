# Project architecture
- Keep the Shroud Builder in `src/features/shroud-builder` as a client-side React feature with isolated styles and CDN media; this preserves the existing site while retaining local 3D and PDF exports.
- Keep blog editing in the existing admin area even though public Latest routes are removed; published content is retained for administrators.
- Proxy Lovable CDN asset requests through Vite only during local development so builder media and browser-created PDFs can use same-origin URLs; deployed hosts serve those paths directly.

# Validation

- Production build: passed (`npm run build`). Vite reports a large bundle warning.
- Lint for all five changed JavaScript files: passed.
- Firebase emulator suite: 6 tests passed, 0 failed; command exited with code 0.
- Login/password checks and persistence after signing out and back in: passed.
- Owner CRUD for all 15 supported record collections: passed.
- Anonymous and cross-user access rejection: passed.
- Unknown/nested paths and unsupported settings fields: rejected as expected.
- Storage ownership, MIME type, 5 MB size limit, overwrite prevention and deletion: passed.

The Windows Java emulator emitted a rules-runtime warning during shutdown after
all tests passed. The test command still returned success. An orphan Java
process holding the test port was cleaned up after the run.

Compatible dependency updates were applied. npm audit still reports 12
transitive findings (8 high and 4 moderate); see BACKEND_SETUP.md. No forced
major upgrades or Firebase downgrades were applied.

Cloud deployment and a manual browser walkthrough were not performed. Supply
your Firebase configuration and follow BACKEND_SETUP.md to activate the backend.

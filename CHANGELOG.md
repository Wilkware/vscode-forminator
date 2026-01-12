# Changelog

## [3.1.0] - Feature (2026-01-12)

- **NEW**: All commands accessible via explorer and context menu
- **NEW**: All menu items now in their own section (development)
- **FIX**: Form sidebar no longer opens automatically
- **FIX**: Translations standardised

## [3.0.3] - Patch (2026-01-11)

- **NEW**: Added compatibility for Symcon version 8.2
- **NEW**: Several checks for the new Symcon version 8.2
- **NEW**: _GetCompatibleParents_ added to the selection
- **FIX**: Allow *.code-workspace file in a new project directory
- **FIX**: Several bug fixes and improvements in the module template

## [3.0.2] - Patch (2025-12-01)

- **FIX**: Code generation for devices with custom I/O or splitters now works correctly.

## [3.0.1] - Patch (2025-10-16)

- **FIX**: Dependencies are now installed correctly

## [3.0.0] - Release (2025-10-13)

- **NEW**: Create a new Symcon library project using an interactive wizard (Library generator wizard).
- **NEW**: Add new modules to an existing Symcon library project with guided input (Modul generator wizard).
- **NEW**: Added command and context menu to update `library.json` build metadata.
- **NEW**: Added command and context menu to assign splitter GUIDs to `module.json`.
- **NEW**: Reworked and extended settings structure (General, Project, Form, and Preview sections).
- **FIX**: Update extension icon for better visual consistency.
- **FIX**: Optimized translations and cleaned up wording across all supported languages.

## [2.1.0] - Feature (2025-09-01)

- **NEW**: Seperate Form elemets and properties in real two views, better decider and scrollbar behaivior
- **NEW**: Added command and context menu for generate and insert a GUID
- **FIX**: iframe allow now data urls for images
- **FIX**: HTML form for element propertie have now the right width
- **FIX**: Seperate sidebar css from the HTML code

## [2.0.0] - Release (2025-08-29)

- **NEW**: Renamed the extension to `Symcon Module Helper`
- **NEW**: Updated icons and logos
- **NEW**: Added Symcon TileVisu Live Preview (`module.html`)
- **NEW**: Added command and context menu for preview
- **NEW**: New settings for `Server IP` and `Server Port` to load resources from the Symcon server
- **NEW**: Theme management for storing and switching between different live preview designs
- **FIX**: Complete refactoring of code and settings
- **FIX**: Added warning when inserting elements if no form file is open
- **FIX**: Added menu command for inserting RegisterProperty calls
- **FIX**: Added missing translations

## [1.3.1] - Patch (2025-08-27)

- **FIX**: Text containing $ characters is now correctly escaped.
- **NEW**: Intelligent cursor position management.

## [1.3.0] - Feature (2025-08-20)

- **NEW**: Add Command for insert RegisterProperty calls into Create().

## [1.2.1] - Patch (2025-08-05)

- **FIX**: Correct wrong localisation settings in package.json

## [1.2.0] - Feature (2025-07-31)

- **NEW**: Add Context menu for translating text values directly from form.json into locale.json

## [1.1.0] - Feature (2025-07-04)

- **NEW**: Setting `Transfer empty values` to include fields with empty values when inserting form elements.
- **NEW**: Setting `Delete default values` to exclude fields with default values when inserting elements.
- **NEW**: Setting `Overwrite default width` to override the default width with a custom value (px or %).
- **NEW**: Setting `Write mandatory keys` to always include specific parameter keys, even if they are empty or match the default (comma-separated list).
- **FIX**: Added `title` and `description` fields to all configuration options to improve clarity in the VS Code settings UI.

## [1.0.3] - Patch (2025-07-04)

- **NEW**: CHANGELOG and DEVELOPMENT files added
- **FIX**: README rewritten

## [1.0.2] - Patch (2025-07-03)

- **FIX**: HTML and CSS optimised for RESIZE

## [1.0.1] - Patch (2025-06-03)

- **FIX**: Correction or extension of package.json.
- **NEW**: New prebuild of elements-css.

## [1.0.0] - Release (2025-06-02)

- **NEW**: Simple element selection and insertion
- **NEW**: Visual settings editor
- **NEW**: Support for JSON formatting
- **NEW**: Support for localisation (EN/DE)

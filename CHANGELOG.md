# Changelog

All notable changes to this project made by Monade Team are documented in this file. For info refer to team@monade.io

## [2.0.0] - 2025-01-24
### Added
- When resolving a model not present in the included array, it returns an error when trying to access it's properties.
- Added a new method `toDTO` to the `Model` class, that returns a DTO object with the model's properties, replacing relationships with ids.
- Added a max depth to the `toJSON` method, to avoid infinite loops when serializing relationships.

### Changed
- BREAKING: the debug now returns a tag (error, warn, info) before the message, allowing to distinguish between error types.

## [1.1.0] - 2023-09-03

### Added
- Zod interoperability with `defineModel()`
- Improved toJSON method
- Improved docs

## [1.0.2] - 2022-08-16
### Added
- Utility interface `DTO<T>`

## [1.0.1] - 2022-03-31

First release

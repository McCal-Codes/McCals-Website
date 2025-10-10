# Version History

- 1.6.0 (2025-10-09): Major efficiency and robustness improvements:
	- Parallel image compression for faster batch processing.
	- Skips existing files and images already smaller than the target size, with clear error/skipped reporting in the UI.
	- Input and file type validation before processing; invalid files are rejected with user feedback.
	- Progress bar and output folder display for improved user feedback.
	- Error summary panel shows skipped, failed, and manifest validation errors after each run.
	- Manifest.json is validated after writing; errors are reported in the UI.
	- Output folder and filenames are sanitized for cross-platform safety.
	- User settings (format, quality, last used folder, etc.) are persisted and reloaded automatically.
	- All changes follow widget and workspace standards for seamless integration and reliability.
- 1.1.0 (2025-10-09): Output folder structure, file naming, and manifest.json now match portfolio manifest conventions for Events, Concert, Journalism, and Nature. UI guides user to enter manifest-style folder path. Ready for direct widget/script ingest.
- 1.0.0 (2025-10-09): Initial release with batch/folder import, manifest sync, and platform toggle groundwork.

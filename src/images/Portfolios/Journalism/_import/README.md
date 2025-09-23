# Journalism Photo Import Directory

Drop your journalism photos here and run `npm run import:journalism` to process them.

## Usage

1. **Add photos**: Copy your new journalism photos to this folder
2. **Run import**: Execute `npm run import:journalism`
3. **Follow prompts**: Enter event date (YYMMDD), event name, and optional category
4. **Generate manifest**: Run `npm run manifest:journalism` (or let the import script do it)
5. **Deploy**: Commit and push your changes

## File Naming

The import script will automatically rename your files to follow the format:
`YYMMDD_EventName_CALxxx.jpg`

Example: `250923_City Council Meeting_CAL001.jpg`

## Categories

You can optionally organize photos into category subfolders like:
- Politics
- Events  
- Portraits
- Sports
- etc.

If no category is specified, photos go directly into the main journalism portfolio folder.

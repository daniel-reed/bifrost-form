# Bifrost Form

## Description

This is a work in progress.

## Initial Release TODO

- Allow Custom ItemContainer
- Allow Custom "Add Item" Button
- Allow Loading Initial Form Data
- Add Form onSubmit
- Consider whether the field wrapper should set aria-describedby and aria-invalid
    - aria-invalid should definitely be set
    - aria-describedby relies on the error implementation setting the id properly
    - not setting them puts more burden on core input implementations to get it right
- Finish Basic Field Components
- Ensure strong accessibility   
- Add listeners for onDisplay and onError
- Add Validation at Collection, Entity, and Form Level
- Find a better name than bifrost
- Provide sane default css
- Audit manual forceUpdate implementation
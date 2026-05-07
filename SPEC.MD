# Prompt versioning API

## Purpose
Provide a rest API to manage prompt and version them.

## Tech choices

- No authentification for now
- No rate limit handling
- No multi-tenancy 
- All dates should be ISO 8601

## API Description 

### Ressource: Prompt Template

Fields: 
- id: uuid, read-only
- name: string, template name with a limit of 50 char
- tags: Tag ressource array, required
- currentVersion: integer, read-only. (Pointer to latest version)
- createdAt: date, read-only

#### Endpoints

#### POST /template
Create a new template with initial content. By default the version is set to 1.

Request body: 
- name: string, required
- tags: See [Tag](#ressource-tag), required
- content: text, required
- variables: See [Variables](#ressources-variables), optional

Responses:
- 201: return template with version 1
- 400: validation issue
- 409: Template already exist

#### GET /template/{id}
Retrieve template with latest version.

Responses:
- 200: return template + latest version
- 404: template not found 

#### PUT /template/{id}
Update template content (create a new version).

Request body: 
- content: text, optional
- tags: See [Tag](#ressource-tag)

Responses: 
- 200: Return updated template with new version
- 400: validation issue
- 404: Template not found

#### Errors
- ALREADY_EXIST -> 400
- NOT_FOUND -> 404
- VALIDATION_ERROR -> 400

### Ressource: Tag

A Tag is a simple string label for categorizing templates. Tags are embedded within a template and are not managed as separate resources.

Fields:
- value: string, template tag label (examples: "ai", "chat", "analysis")

Notes:
- Tags are included in POST /template and PUT /template request bodies as an array of strings
- No separate endpoints for tag management

### Ressource: Variables

Variables are placeholders that can be substituted within a template's content. Variables are defined as part of the template and are versioned alongside it.

Fields:
- id: uuid, read-only
- name: string, variable name (used for substitution in template content), required
- defaultValue: string, optional value used if no value provided at prompt generation time, optional

Notes:
- Variables are embedded within a template definition
- Each Variable must have a unique name within its template
- Variables are versioned: when a template is updated, its variable list is part of the new version
- Variables have no separate endpoints; they are managed only through template operations (POST /template, PUT /template/{id})

### Ressource: Prompt Version

A Prompt Version represents a point-in-time snapshot of a template's content and configuration. Each version is immutable and referenced by version number.

Fields:
- versionNumber: integer, read-only, semantic version within the template (starting from 1)
- templateId: uuid, read-only, reference to the parent template
- content: text, read-only, template content at this version
- variables: Variables array, read-only, list of variables defined in this version
- tags: string array, read-only, tags assigned in this version
- createdAt: date (ISO 8601), read-only, timestamp when version was created

#### Endpoints

#### GET /template/{id}/versions
Retrieve all versions of a template.

Responses:
- 200: return array of Prompt Version objects (ordered by versionNumber descending)
- 404: template not found

#### GET /template/{id}/versions/{versionNumber}
Retrieve a specific version of a template.

Responses:
- 200: return Prompt Version object
- 404: template not found or version does not exist

### Ressource: Prompt

A Prompt is the resolved output generated from a template and a set of variable values. It combines a template's content with substituted variable values.

Fields:
- id: uuid, read-only
- templateId: uuid, read-only, reference to the template used
- versionUsed: integer, read-only, version number of the template used to generate this prompt
- content: text, read-only, template content with all variables substituted
- variables: object, read-only, map of variable names to their resolved values (example: {"name": "John", "age": "30"})
- createdAt: date (ISO 8601), read-only, timestamp when prompt was generated

#### Endpoints

#### POST /prompt
Generate a new prompt from a template using provided or default variable values.

Request body:
- templateId: uuid, required, reference to the template to use
- variables: object, optional, map of variable names to values (example: {"name": "John", "age": "30"})

Notes:
- If a variable is not provided in the request, the template's default value is used if available
- If a required variable (no default value) is missing, a VALIDATION_ERROR is returned
- The generated prompt uses the template's current version

Responses:
- 200: return generated Prompt object
- 400: validation error (missing required variables listed with names)
- 404: template not found
# Cevvy - An advanced CV generator


## Overview
An application that generates a CV or Cover Letter using an agentic workflow.


## Project Structure

## Usage

### Running the application
run the 


### Input
CV 
	- .docx, .pdf, .json, .md, .yaml, text input
Project description (text)
	- .docx, .json, .md, .yaml, text input
Job Description (text) [optimal]
	- .docx, .json, .md, .yaml, text input


	

... 


## Database
DATABASE - postgreSQL


### Tables


#### *Users*
- NUMBER id [PK]
- TEXT email
- TEXT fullName
- TEXT passwordHash
- TIMESTAMP createdAt
- TIMESTAMP updatedAt


#### *AuthSession*
- NUMBER id [PK].
- TEXT userId [FK]
- TEXT sessionToken [UK]
- TEXT crsfToken
- TIMESTAMP createdAt
- TIMESTAMP updatedAt
- TIMESTAMP expiresAt

#### *Workspaces*
- id [PK]
- 

#### *Applications*
- id [PK]




#### *CVs*
- id [PK]
- WorkspaceId [FK]
- TEXT documentType [PDF, JSON, MD, HTML]
- TEXT userId FK
- TEXT CVfullName
- TEXT template
- TEXT targetRole
- TEXT generationDescription
- TEXT colorTheme
- TEXT styleTone


- TIMESTAMP publishedAt
- TEXT lastRevisionKind
- TIMESTAMP createdAt
- TIMESTAMP updatedAt


# Tables

## Connections

Users -> 1:many -> CVs
Users -> 1:many -> CoverLetters
Users -> 1:many -> Workspaces

Workspaces -> 1:1 -> CVs
Workspaces -> 1:1 -> CoverLetter


## *Users*
- NUMBER id [PK]
- TEXT email
- TEXT fullName
- TEXT phoneNumber
- TEXT linkedin
- TEXT github
- TEXT passwordHash
- TIMESTAMP createdAt
- TIMESTAMP updatedAt


## *Workspaces*
- NUMBER id [PK]
- NUMBER user_id [FK]


## *CVs*
- id [PK]
- NUMBER user_id [FK]
- NUMBER workspace_id [FK]
- TEXT documentType [PDF, JSON, MD, HTML]
- TEXT CVfullName
- TEXT summary
- TEXT targetRole
- TEXT experience
- TEXT education
- TEXT skills
- TEXT hobbies
- TIMESTAMP publishedAt
- TEXT lastRevisionKind
- TIMESTAMP createdAt
- TIMESTAMP updatedAt



## *CoverLetters*
- id [PK]
- NUMBER user_id [FK]
- NUMBER workspace_id [FK]
- TEXT text
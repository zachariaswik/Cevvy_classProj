
# Tables


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



## *CVs*
- id [PK]
- TEXT documentType [PDF, JSON, MD, HTML]
- NUMBER user_id [FK]
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


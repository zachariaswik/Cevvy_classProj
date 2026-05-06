# Entity Relationship Diagram

```mermaid
erDiagram
    Users {
        NUMBER id PK
        TEXT email
        TEXT fullName
        TEXT phoneNumber
        TEXT linkedin
        TEXT github
        TEXT passwordHash
        TIMESTAMP createdAt
        TIMESTAMP updatedAt
    }

    Workspaces {
        NUMBER id PK
        NUMBER user_id FK
    }

    CVs {
        NUMBER id PK
        NUMBER user_id FK
        NUMBER workspace_id FK
        TEXT documentType
        TEXT CVfullName
        TEXT summary
        TEXT targetRole
        TEXT experience
        TEXT education
        TEXT skills
        TEXT hobbies
        TEXT lastRevisionKind
        TIMESTAMP publishedAt
        TIMESTAMP createdAt
        TIMESTAMP updatedAt
    }

    CoverLetters {
        NUMBER id PK
        NUMBER user_id FK
        NUMBER workspace_id FK
        TEXT text
    }

    Users ||--o{ Workspaces : "owns"
    Users ||--o{ CVs : "owns"
    Users ||--o{ CoverLetters : "owns"
    Workspaces ||--o| CVs : "has"
    Workspaces ||--o| CoverLetters : "has"
```

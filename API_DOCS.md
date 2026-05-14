# API Documentation

## Base URL
`http://localhost:5000/api`

## Authentication

### `POST /auth/signup`
Creates a new user account.
- **Body**: `{ "name": "User", "email": "user@example.com", "password": "password" }`
- **Response**: `{ "_id": "...", "name": "...", "email": "...", "token": "..." }`

### `POST /auth/login`
Authenticates a user and returns a token.
- **Body**: `{ "email": "user@example.com", "password": "password" }`
- **Response**: `{ "_id": "...", "name": "...", "email": "...", "token": "..." }`

---

## Projects
*Requires Authorization Header: `Bearer <token>`*

### `GET /projects`
Fetches all projects the current user is a member of.
- **Response**: `[ { "_id": "...", "title": "...", "members": [...] } ]`

### `POST /projects`
Creates a new project.
- **Body**: `{ "title": "Project Name", "description": "Project details" }`

### `GET /projects/:id`
Fetches project details if the user is a member.

### `POST /projects/:id/members`
Adds a user to a project (Only the owner can do this).
- **Body**: `{ "email": "member@example.com" }`

---

## Tasks
*Requires Authorization Header: `Bearer <token>`*

### `GET /projects/:projectId/tasks`
Fetches all tasks for a specific project.

### `POST /projects/:projectId/tasks`
Creates a new task in a project.
- **Body**: `{ "title": "Task 1", "description": "Details", "priority": "Medium", "status": "Todo" }`

### `PATCH /projects/:projectId/tasks/:taskId/status`
Updates the status of a task (useful for drag-and-drop).
- **Body**: `{ "status": "In Progress" }`

### `PUT /projects/:projectId/tasks/:taskId`
Updates a task's full details.

### `DELETE /projects/:projectId/tasks/:taskId`
Deletes a task.

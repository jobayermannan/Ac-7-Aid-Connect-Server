

```markdown
# Aid Connect  API

This is a Aid Connect  API built with Express, MongoDB, and Cloudinary. It allows users to register, log in, and manage supply posts, including uploading images to Cloudinary.

## Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [License](#license)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repo-link.git
   cd your-repo-directory
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up your environment variables (see [Environment Variables](#environment-variables)).

4. Start the server:

   ```bash
   npm start
   ```

## Environment Variables

Create a `.env` file in the root directory of your project and add the following environment variables:

```env
PORT=3001
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EXPIRES_IN=1h
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
```

## Usage

### Register a User

```bash
POST /api/v1/register
```

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "yourpassword"
}
```

### Login a User

```bash
POST /api/v1/login
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "yourpassword"
}
```

### Fetch Supply Posts

```bash
GET /api/v1/supplies
```

### Create a Supply Post

```bash
POST /api/v1/create-supplies
```

**Request Body:**

- `image`: File (image)
- `category`: String
- `title`: String
- `amount`: String
- `featuring`: Boolean

### Update a Supply Post

```bash
PATCH /api/v1/update-supplies/:id
```

**Request Body:**

- `image`: File (image) (optional)
- `category`: String (optional)
- `title`: String (optional)
- `amount`: String (optional)
- `isFeatured`: Boolean (optional)

### Delete a Supply Post

```bash
DELETE /api/v1/delete-supplies/:id
```

## API Endpoints

- `GET /`: Test route to check if the server is running.
- `POST /api/v1/register`: Register a new user.
- `POST /api/v1/login`: Login a user.
- `GET /api/v1/supplies`: Fetch all supply posts.
- `POST /api/v1/create-supplies`: Create a new supply post.
- `PATCH /api/v1/update-supplies/:id`: Update an existing supply post.
- `DELETE /api/v1/delete-supplies/:id`: Delete a supply post.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
```

This `README.md` file provides a comprehensive overview of your project, including installation instructions, environment variables, usage examples, and API endpoints. Adjust the repository link and any other specific details as needed.
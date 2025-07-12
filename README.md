# TechTrek Time Tracking

## Project Structure

The project is organized as a monorepo (no nx) with two main parts:

-   `client/`: Contains the Angular frontend application.
-   `backend/`: Contains the NestJS backend API.

## Technology Stack

-   **Frontend (Client):**
    -   Angular
    -   TypeScript
    -   Angular Material
    -   OpenLayers (for maps)
    -   FullCalendar
    -   SCSS
-   **Backend:**
    -   NestJS
    -   TypeScript
    -   TypeORM
    -   SQLite

## Setup and Running

**Prerequisites:**

-   Node.js (v18 or later recommended)
-   npm or yarn

**Backend Setup:**

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```
3.  Run the backend server in development mode (with hot-reloading):
    ```bash
    npm run start:dev
    # or
    yarn start:dev
    ```
    The backend API will be available at `http://localhost:3000`.

**Client Setup:**

1.  Navigate to the client directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```
3.  Run the Angular development server:
    ```bash
    ng serve
    ```
    The frontend application will be available at `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Key Features

-   User Authentication
-   Clock In/Out functionality
-   Absence Request Management
-   Clocking Modification
-   Holiday Planning Overview
-   Home Office Management (defining locations via map, requesting home office days)
-   User Preferences
-   E2E and Unit testing
-   Full dark mode support


![Screenshot_13-7-2025_02539_localhost](https://github.com/user-attachments/assets/f3927986-05ef-4463-b306-684f94fc1fc8)
![Screenshot_13-7-2025_02831_localhost](https://github.com/user-attachments/assets/fe754937-5486-4038-8100-56d6a88b8e0e)
![Screenshot_13-7-2025_0294_localhost](https://github.com/user-attachments/assets/2cb1ce2d-1d1e-40be-873d-b1507bc84eda)
![Screenshot_13-7-2025_02917_localhost](https://github.com/user-attachments/assets/26b91528-74b4-48e9-abd9-a5980941c7a0)







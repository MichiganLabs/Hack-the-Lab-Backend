# Hack the Lab 2024 API

This is the API for Hack the Lab 2024. It's written with Typescript for Node.js and Express.js.

## Getting started

- Install Node v18.18.2 via the Node Version Manager tool:
  - Install nvm: `brew install nvm`
  - Install Node v18.18.2: `nvm install 18.18.2`
  - Set Node v18.18.2 as the default version: `nvm alias default 18.18.2`
  - Verify that Node v18.18.2 is installed: `node -v`
- Clone the repository: `git clone https://github.com/MichiganLabs/Hack-the-Lab-Backend.git`
- Navigate to the project directory: `cd Hack-the-Lab-Backend`
- Install the dependencies: `npm i`
- Run the server locally: `npm run dev`

## How things are organized

- `package.json`: This contains all of the dependencies and helpful scripts for the project. You can run any of these scripts with `npm run <script-name>`, or create your own. They will always run as though you're running them from the root of the project, via terminal. We can use these commands to help speed up tasks, and automate deployments.

![package.json scripts](resources/deps.png)

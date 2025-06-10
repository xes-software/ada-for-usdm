# Repository Configuration

This project relies on the following tools installed: `Node.js 22+`, `npm 10.9.2`, & `Aiken CLI v1.1.17+`.

1. `npm i && npx prisma generate` in /root directory.
2. Go to [Maestro Dashboard](https://dashboard.gomaestro.com) and create a free account and create a Preprod Cardano project.
3. Go to [Vercel Dashboard](https://vercel.com/dashboard) and create a new project.
4. In Vercel project storage create an integration with Neon postgres.
5. Gather all environment variables and put in a .env file locally.
6. Run `npx prisma db push` to push the schema to the remote database.
7. `npm run dev` to run and test locally.
8. Link the project with Vercel, and configure automatic deployments to 'main', push to GitHub.
9. Add the remaining env vars to the Vercel deployment (database urls will already be inserted with the neon integration).

## Make it your own

Make changes to the aiken validators in the `/aiken-workspace` directory.

### values for .env file

- DATABASE_URL="" (String to neon postgresql db)
- DATABASE_URL_UNPOOLED="" (String for unpooled db connection for migrations)
- NODE_ENV="" ('production' | 'staging' | 'development')
- MAESTRO_CARDANO_API_KEY="" (found in a cardano maestro project).
- CARDANO_NETWORK="" ("Mainnet" | "Preprod" | "Preview)

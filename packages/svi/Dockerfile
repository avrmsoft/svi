FROM node:20

WORKDIR /app

RUN corepack enable

# force pnpm store location (IMPORTANT: before install)
RUN pnpm config set store-dir /pnpm-store

# copy only dependency manifests first (for caching)
COPY package.json pnpm-lock.yaml* ./

RUN pnpm install

# copy rest of the project
COPY . .

CMD ["bash"]
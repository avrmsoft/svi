FROM node:20

WORKDIR /app

RUN corepack enable

# Nur dependency files zuerst (Cache!)
COPY package.json pnpm-lock.yaml* ./

RUN pnpm install

# Dann restlicher Code
COPY . .

CMD ["bash"]
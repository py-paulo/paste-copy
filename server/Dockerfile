FROM node:20-alpine3.20

WORKDIR /usr/src/app

COPY package-lock.json package.json ./
   
RUN npm ci

COPY . .

EXPOSE 8000

CMD [ "npm", "run", "dev" ]
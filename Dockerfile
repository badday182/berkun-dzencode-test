FROM node:22.11.0-alpine 

WORKDIR /my-app

COPY ./my-app/package.json ./my-app/package-lock.json* ./

RUN npm install 

COPY ./my-app .

CMD ["npm", "run", "dev"]
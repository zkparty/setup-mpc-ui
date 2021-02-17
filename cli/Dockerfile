FROM node:14

WORKDIR /usr/src/app

COPY package.json package.json
RUN npm install

COPY . .
RUN npm run build
RUN mkdir data
RUN chmod 755 run.sh

CMD ["node", "dist/"]
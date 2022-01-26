FROM node

WORKDIR /usr/app

COPY package*.json ./

RUN npm ci

COPY ./ ./

RUN wget -O ./wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh
RUN chmod +x ./wait-for-it.sh

CMD ["node", "index.js"]
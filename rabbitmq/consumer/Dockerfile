FROM node

WORKDIR /usr/app

COPY package*.json ./

RUN npm ci

COPY ./ ./

RUN wget -O /bin/wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh
RUN chmod +x /bin/wait-for-it.sh

CMD ["node", "index.js"]
FROM openalpr/openalpr:latest

WORKDIR /usr/app

COPY package*.json ./

RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash -
# RUN apt clean
RUN apt-get install -y nodejs
RUN npm install

COPY ./ ./

ENTRYPOINT ["node", "index.js"]

EXPOSE 3002
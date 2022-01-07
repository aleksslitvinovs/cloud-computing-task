FROM ubuntu:latest

RUN useradd litvinovs
RUN usermod -aG sudo litvinovs

WORKDIR /usr/local

RUN apt-get update
RUN apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_17.x | bash -
RUN apt-get install -y nodejs

ADD ./ /usr/local/

RUN npm install

RUN chown -R litvinovs /usr/local

EXPOSE 100

HEALTHCHECK --interval=10s --timeout=3s CMD node index.js

USER litvinovs
CMD ["node", "index.js"]
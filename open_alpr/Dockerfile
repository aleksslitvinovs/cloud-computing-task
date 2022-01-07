FROM openalpr/openalpr:latest

WORKDIR /usr/local 

COPY ./ /usr/local

# ENTRYPOINT [ "/bin/bash" ]
EXPOSE 3001

RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs
RUN npm install

CMD ["node", "index.js"]
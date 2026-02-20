FROM node:22

WORKDIR /src

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3300
EXPOSE 5173

CMD ["./start.sh"]
FROM --platform=linux/amd64 node:12

# Create unprivileged user

RUN groupadd --system vulnogram && useradd --system --create-home --gid vulnogram vulnogram

WORKDIR /home/vulnogram
COPY ./package*.json /home/vulnogram
RUN chown vulnogram:vulnogram --recursive /home/vulnogram/

USER vulnogram
RUN npm install

USER root
COPY . /home/vulnogram/

RUN chown vulnogram:vulnogram --recursive .
USER vulnogram

CMD ["npm", "start", "--prefix", "/home/vulnogram"]

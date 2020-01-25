FROM mhart/alpine-node:11 as builder
WORKDIR /react-hsl
COPY . .
RUN npm install react-scripts -g --silent
RUN yarn install
RUN yarn run build

FROM mhart/alpine-node
RUN yarn global add serve
WORKDIR /react-hsl
COPY --from=builder /react-hsl/build .
CMD ["serve", "-p", "80", "-s", "."]doc

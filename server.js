const express = require("express");
const dotenv = require("dotenv");
const userRouter = require("./routers/userRouter");
const categoryRouter = require("./routers/categoryRouter"); // ✅ fixed here
const productRouter = require("./routers/productRouter");
const cartRouter = require("./routers/cartRouter");
const paymentRouter = require("./routers/paymentRouter");
const cors = require("cors");
const { swaggerUi, swaggerSpec } = require("./swagger/swagger");
dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ['http://localhost:5173', 'https://granduer-steel.vercel.app'],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use("/", userRouter);
app.use("/", categoryRouter);
app.use("/", productRouter);
app.use("/", cartRouter);
app.use("/", paymentRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});

import { generateAccessToken, paypal } from "../lib/paypal";

// Test to generate access token
test("generates token from paypal", async () => {
  const generateToken = await generateAccessToken();
  console.log(generateToken);
  expect(typeof generateToken).toBe("string");
  expect(generateToken.length).toBeGreaterThan(0);
});

test("test to create a paypal order", async () => {
  const token = await generateAccessToken();
  const price = 100;

  const orderResponse = await paypal.createOrder(price);
  console.log(orderResponse);
  expect(orderResponse).toHaveProperty("id");
  expect(orderResponse).toHaveProperty("status");
  expect(orderResponse.status).toBe("CREATED");
});

test("test to capture payment with a mock order", async () => {
  const price = 100;

  const orderResponse = await paypal.createOrder(price);
  console.log(orderResponse);
  expect(orderResponse).toHaveProperty("id");
  expect(orderResponse).toHaveProperty("status");
  expect(orderResponse.status).toBe("CREATED");
});

test("mock capture payment", async () => {
  const orderId = "100";

  const mockCapturePayment = jest
    .spyOn(paypal, "capturePayment")
    .mockResolvedValue({
      id: orderId,
      status: "COMPLETED",
    });

  const response = await paypal.capturePayment(orderId);

  expect(response).toHaveProperty("status", "COMPLETED");

  mockCapturePayment.mockRestore();
});

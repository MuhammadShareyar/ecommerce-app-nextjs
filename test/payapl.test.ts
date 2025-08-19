import { generateAccessToken } from "../lib/paypal";

// Test to generate access token
test("generates token from paypal", async () => {
  const generateToken = await generateAccessToken();
  console.log(generateToken);
  expect(typeof generateToken).toBe("string");
  expect(generateToken.length).toBeGreaterThan(0);
});

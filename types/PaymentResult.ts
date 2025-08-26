import { z } from "zod";
import { paymentResultSchema } from "@/lib/validator";

export type PaymentResult = z.infer<typeof paymentResultSchema>;

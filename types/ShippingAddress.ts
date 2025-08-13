import { z } from "zod";
import { shippingAddressSchema } from "@/lib/validator";

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

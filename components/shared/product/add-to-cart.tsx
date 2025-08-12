"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CartItem } from "@/types/Cart";
import { addItemToCart } from "@/lib/actions/cart.actions";
import { Plus } from "lucide-react";

const AddToCart = ({ item }: { item: CartItem }) => {
  const router = useRouter();

  const handleAddToCart = async () => {
    const res = await addItemToCart(item);

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    // handle success
    toast.success(`${item.name} added to cart.`, {
      action: {
        label: "Go to cart",
        onClick: () => {
          router.push("/cart");
        },
      },
    });
  };
  return (
    <Button
      className="w-full cursor-pointer"
      type="button"
      onClick={handleAddToCart}
    >
      <Plus /> Add to Cart
    </Button>
  );
};

export default AddToCart;

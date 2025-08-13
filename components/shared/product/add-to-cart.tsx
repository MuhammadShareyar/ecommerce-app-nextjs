"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Cart, CartItem } from "@/types/Cart";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { Minus, Plus } from "lucide-react";

const AddToCart = ({ item, cart }: { item: CartItem; cart?: Cart }) => {
  const router = useRouter();

  const handleAddToCart = async () => {
    const res = await addItemToCart(item);

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    // handle success
    toast.success(`${res.message}`, {
      action: {
        label: "Go to cart",
        onClick: () => {
          router.push("/cart");
        },
      },
    });
  };
  const existItem =
    cart && cart.items.find((x) => x.productId === item.productId);

  const handleRemoveFromCart = async () => {
    const res = await removeItemFromCart(item.productId);

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    // handle success
    toast.success(`${res.message}`, {
      action: {
        label: "Go to cart",
        onClick: () => {
          router.push("/cart");
        },
      },
    });
  };

  return existItem ? (
    <div>
      <Button
        type="button"
        variant="outline"
        className="cursor-pointer"
        onClick={handleRemoveFromCart}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="px-2">{existItem.qty}</span>
      <Button
        type="button"
        variant="outline"
        className="cursor-pointer"
        onClick={handleAddToCart}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  ) : (
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

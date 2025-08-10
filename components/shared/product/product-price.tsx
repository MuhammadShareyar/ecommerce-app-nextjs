import { cn } from "@/lib/utils";

interface Props {
  value: number;
  className?: string;
}

const ProductPrice = ({ value, className }: Props) => {
  const stringValue = value.toFixed(2);

  //   Get the Int/Float
  const [intValue, floatValue] = stringValue.split(".");

  return (
    <p className={cn("text-2xl", className)}>
      <span className="text-xs align-super">$</span>
      {intValue}
      <span className="text-xs align-super">.{floatValue}</span>
    </p>
  );
};

export default ProductPrice;

"use client"
import { Button } from "@/components/ui/button";
import { formatQueryParams } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  page: number;
  totalPages: number;
  urlParamName?: string;
};

const Pagination = ({ page, totalPages, urlParamName }: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleClick = (type: string) => {
    const pageValue = type === "prev" ? page - 1 : page + 1;
    const newUrl = formatQueryParams({
      params: searchParams.toString(),
      key: urlParamName || "page",
      value: pageValue.toString(),
    });

    router.push(newUrl);
  };
  return (
    <div className="flex gap-4  py-2">
      <Button
        size="lg"
        variant="outline"
        className="w-28"
        disabled={page <= 1}
        onClick={() => handleClick("prev")}
      >
        Previous
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="w-28"
        disabled={page >= totalPages}
        onClick={() => handleClick("next")}
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;

import React from "react";
import { Button } from "@/components/ui/button"; // Import Button custom
import {
 
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
interface PaginationProps {
  page: number;
  totalPage: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPage, totalCount, onPageChange }) => {
  return (
    <div className="flex justify-center items-center gap-4 mt-2">
      <Button
        variant="outline" // hoặc tuỳ chỉnh variant cho đẹp
        size="sm"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        {"<"}
      </Button>
      
      <span>
        第 {page}/{totalPage} 頁（共 {totalCount} 筆資料）
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page === totalPage}
        onClick={() => onPageChange(page + 1)}
      >
        {">"}
      </Button>
    </div>
  );
};

export default Pagination;

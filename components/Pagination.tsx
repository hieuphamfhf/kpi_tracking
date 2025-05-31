import React from "react";

interface PaginationProps {
  page: number;
  totalPage: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPage, totalCount, onPageChange }) => {
  return (
    <div className="flex justify-center items-center gap-4 mt-2">
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="px-2 py-1 border rounded disabled:opacity-50"
      >
        {"<"}
      </button>
      <span>
        第 {page}/{totalPage} 頁（共 {totalCount} 筆資料）
      </span>
      <button
        disabled={page === totalPage}
        onClick={() => onPageChange(page + 1)}
        className="px-2 py-1 border rounded disabled:opacity-50"
      >
        {">"}
      </button>
    </div>
  );
};

export default Pagination;

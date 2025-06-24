import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const getVisiblePages = () => {
    const pages = [];
    
    // Nếu tổng số trang ít hơn hoặc bằng 5, hiển thị tất cả
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }
    
    // Tính toán phạm vi trang cần hiển thị
    if (currentPage <= 3) {
      // Trang đầu: hiển thị 1, 2, 3, 4, ... last
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Trang cuối: hiển thị 1, ..., n-3, n-2, n-1, n
      pages.push(1, '...', totalPages-3, totalPages-2, totalPages-1, totalPages);
    } else {
      // Ở giữa: hiển thị 1, ..., current-1, current, current+1, ..., last
      pages.push(1, '...', currentPage-1, currentPage, currentPage+1, '...', totalPages);
    }
    
    return pages;
  }

  if (totalPages <= 1) return null

  return (
    <nav className="pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-button flex items-center disabled"
      >
        <ChevronLeft size={16} />
      </button>

      {getVisiblePages().map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="pagination-ellipsis">...</span>
          ) : (
            <button
              onClick={() => onPageChange(page as number)}
              className={`pagination-button ${currentPage === page ? 'active' : ''}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-button flex items-center disabled"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  )
}

export default Pagination
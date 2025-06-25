import * as React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const getVisiblePages = () => {
    const pages = [];
    
    // If total pages is less than or equal to 5, display all pages
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }
    
    // Calculate the range of pages to display
    if (currentPage <= 3) {
      // First page: display 1, 2, 3, 4, ... last
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Last page: display 1, ..., n-3, n-2, n-1, n
      pages.push(1, '...', totalPages-3, totalPages-2, totalPages-1, totalPages);
    } else {
      // Middle page: display 1, ..., current-1, current, current+1, ..., last
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
        <FaChevronLeft className="w-4 h-4" />
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
        <FaChevronRight className="w-4 h-4" />
      </button>
    </nav>
  )
}

export default Pagination
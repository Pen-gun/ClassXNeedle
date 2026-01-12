type Props = {
  page: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
};

const PaginationControls = ({ page, totalPages, onPageChange }: Props) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 pt-4 text-xs text-stone-400">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="btn-ghost text-xs text-white/80 hover:text-white bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="btn-ghost text-xs text-white/80 hover:text-white bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};

export default PaginationControls;

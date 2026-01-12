import SectionShell from '../SectionShell';
import OrdersList from './orders/OrdersList';
import useOrdersSection from './orders/useOrdersSection';
import PaginationControls from '../components/PaginationControls';

const OrdersSection = () => {
  const {
    orders,
    updateStatus,
    markPaid,
    cancel,
    page,
    totalPages,
    setPage,
    status,
    setStatus,
    search,
    setSearch
  } = useOrdersSection();

  return (
    <SectionShell title="Orders" subtitle="Track and fulfill customer orders.">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            className="input bg-white/10 text-white flex-1 min-w-[220px]"
            placeholder="Search by order ID"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <select
            className="input bg-gray-700 text-white text-sm"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      <OrdersList
        orders={orders}
        onStatus={updateStatus}
        onPaid={markPaid}
        onCancel={cancel}
      />
      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </SectionShell>
  );
};

export default OrdersSection;

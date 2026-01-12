import SectionShell from '../SectionShell';
import OrdersList from './orders/OrdersList';
import useOrdersSection from './orders/useOrdersSection';
import PaginationControls from '../components/PaginationControls';

const OrdersSection = () => {
  const { orders, updateStatus, markPaid, cancel, page, totalPages, setPage } = useOrdersSection();

  return (
    <SectionShell title="Orders" subtitle="Track and fulfill customer orders.">
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

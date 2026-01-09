import SectionShell from '../SectionShell';
import OrdersList from './orders/OrdersList';
import useOrdersSection from './orders/useOrdersSection';

const OrdersSection = () => {
  const { orders, updateStatus, markPaid, cancel } = useOrdersSection();

  return (
    <SectionShell title="Orders" subtitle="Track and fulfill customer orders.">
      <OrdersList
        orders={orders}
        onStatus={updateStatus}
        onPaid={markPaid}
        onCancel={cancel}
      />
    </SectionShell>
  );
};

export default OrdersSection;
